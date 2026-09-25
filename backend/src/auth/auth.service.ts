import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { User } from './user.entity.js';
import { EmailService } from '../email/email.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PreLoginDto } from './dto/pre-login.dto.js';
import { RequestResetDto, ResetPasswordDto, RedeemRecoveryCodeDto } from './dto/recovery.dto.js';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service.js';
import { AuditAction } from '../audit/audit-log.entity.js';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly auditService: AuditService,
    ) { }

    private hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // 1. Generate 8-10 random recovery codes (e.g., "ABCD-1234")
    generateRecoveryCodes(count = 8): { plaintextCodes: string[]; hashedCodes: string[] } {
        const plaintextCodes: string[] = [];
        const hashedCodes: string[] = [];

        for (let i = 0; i < count; i++) {
            const raw = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 chars
            plaintextCodes.push(raw);
            hashedCodes.push(this.hashData(raw));
        }

        return { plaintextCodes, hashedCodes };
    }

    // 2. Updated Register: Includes emergency codes
    async register(registerDto: RegisterDto) {
        const { email, password, authSalt } = registerDto;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('A user with this email already exists.');
        }

        const authHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        const { plaintextCodes, hashedCodes } = this.generateRecoveryCodes(8);

        const user = this.userRepository.create({
            email,
            authHash,
            authSalt,
            recoveryCodesHash: hashedCodes,
        });

        await this.userRepository.save(user);

        return {
            message: 'User registered successfully. Save your recovery codes safely.',
            userId: user.id,
            email: user.email,
            recoveryCodes: plaintextCodes, // Return once for client Emergency Kit download
        };
    }

    // 3. Request Password Recovery via Brevo (Anti-Enumeration)
    async requestPasswordReset(dto: RequestResetDto) {
        const genericResponse = {
            message: 'If an account exists with this email, a reset link has been dispatched.',
        };

        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) return genericResponse;

        // Generate 32-byte secure random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordTokenHash = this.hashData(resetToken);
        user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

        await this.userRepository.save(user);

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
        await this.emailService.sendRecoveryEmail(user.email, resetLink);

        return genericResponse;
    }

    // 4. Complete Password Reset
    async resetPassword(dto: ResetPasswordDto) {
        const incomingHash = this.hashData(dto.token);

        const user = await this.userRepository.findOne({
            where: { resetPasswordTokenHash: incomingHash },
        });

        if (!user || !user.resetPasswordExpiresAt) {
            throw new BadRequestException('Invalid or expired reset token.');
        }

        if (new Date() > user.resetPasswordExpiresAt) {
            user.resetPasswordTokenHash = null;
            user.resetPasswordExpiresAt = null;
            await this.userRepository.save(user);
            throw new BadRequestException('Invalid or expired reset token.');
        }

        // Hash new Auth Secret with Argon2id
        user.authHash = await argon2.hash(dto.newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });
        user.authSalt = dto.newAuthSalt;

        // Invalidate reset token (single-use)
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        await this.userRepository.save(user);

        return { message: 'Password has been reset successfully. Please log in with your new credentials.' };
    }

    // 5. Redeem Emergency Backup Recovery Code (Bypasses 2FA)
    async redeemRecoveryCode(dto: RedeemRecoveryCodeDto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Invalid recovery credentials.');

        const incomingHash = this.hashData(dto.code);
        const codeIndex = user.recoveryCodesHash.findIndex((h) => h === incomingHash);

        if (codeIndex === -1) {
            throw new UnauthorizedException('Invalid recovery code.');
        }

        // Remove the redeemed single-use code
        user.recoveryCodesHash.splice(codeIndex, 1);
        await this.userRepository.save(user);

        // Issue rotated session tokens
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return {
            message: 'Recovery code accepted. Configure your new credentials immediately.',
            remainingCodes: user.recoveryCodesHash.length,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: 'Bearer',
            expiresIn: '15m',
        };
    }
    async getPreLoginSalt(preLoginDto: PreLoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: preLoginDto.email },
            select: {
                authSalt: true, // <-- Changed from select: ['authSalt']
            },
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        return { authSalt: user.authSalt };
    }
    private maskEmail(email: string): string {
        const parts = email.split('@');
        if (parts.length !== 2) return email;
        const [name, domain] = parts;
        if (name.length <= 2) return `${name[0]}***@${domain}`;
        return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
    }

    async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        let isMatch = false;
        try {
            isMatch = await argon2.verify(user.authHash, password);
        } catch {
            isMatch = (user.authHash === password);
        }

        if (!isMatch) {
            // Record login failure
            await this.auditService.record({
                userId: user.id,
                action: AuditAction.LOGIN_FAILURE,
                ipAddress,
                userAgent,
                metadata: { reason: 'Bad password' },
            });
            throw new UnauthorizedException('Invalid credentials.');
        }

        // Conditional 2FA Check
        if (user.isTwoFactorEnabled) {
            // 1. Generate 6-digit numeric OTP
            const rawOtp = crypto.randomInt(100000, 999999).toString();

            // 2. Hash OTP at rest with 10-minute expiry
            user.twoFactorOtpHash = this.hashData(rawOtp);
            user.twoFactorOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await this.userRepository.save(user);

            // 3. Dispatch raw OTP via Brevo
            try {
                await this.emailService.sendOtpEmail(user.email, rawOtp);
            } catch (emailErr) {
                this.logger.error('Failed to dispatch 2FA OTP email via Brevo:', emailErr);
            }

            // 4. Issue temporary 5-minute signed token
            const tempToken = this.jwtService.sign(
                { sub: user.id, email: user.email, is2FA: true },
                { expiresIn: '5m' },
            );

            return {
                requires2FA: true,
                tempToken,
                email: this.maskEmail(user.email),
            };
        }

        // Standard session when 2FA is disabled
        await this.auditService.record({
            userId: user.id,
            action: AuditAction.LOGIN_SUCCESS,
            ipAddress,
            userAgent,
            metadata: { email: user.email },
        });

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return {
            requires2FA: false,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: {
                id: user.id,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            },
        };
    }

    // Verify 2FA OTP during login workflow using tempToken
    async verifyLoginOtp(code: string, tempTokenStr?: string) {
        if (!tempTokenStr) {
            throw new UnauthorizedException('Missing temporary 2FA authentication token.');
        }

        let payload: any;
        try {
            payload = this.jwtService.verify(tempTokenStr);
        } catch {
            throw new UnauthorizedException('Temporary 2FA session expired. Please log in again.');
        }

        if (!payload || !payload.sub || !payload.is2FA) {
            throw new UnauthorizedException('Invalid 2FA authentication token.');
        }

        const user = await this.userRepository.findOne({ where: { id: payload.sub } });
        if (!user || !user.twoFactorOtpHash || !user.twoFactorOtpExpiresAt) {
            throw new BadRequestException('No active 2FA verification request found.');
        }

        // 1. Check expiration
        if (new Date() > user.twoFactorOtpExpiresAt) {
            user.twoFactorOtpHash = null;
            user.twoFactorOtpExpiresAt = null;
            await this.userRepository.save(user);
            throw new UnauthorizedException('Verification code has expired. Please request a new code.');
        }

        // 2. Hash comparison
        const incomingHash = this.hashData(code);
        let isValid = false;
        try {
            isValid = crypto.timingSafeEqual(
                Buffer.from(incomingHash),
                Buffer.from(user.twoFactorOtpHash),
            );
        } catch {
            isValid = (incomingHash === user.twoFactorOtpHash);
        }

        if (!isValid) {
            throw new UnauthorizedException('Invalid 6-digit verification code.');
        }

        // 3. Single-use invalidation (replay protection)
        user.twoFactorOtpHash = null;
        user.twoFactorOtpExpiresAt = null;
        await this.userRepository.save(user);

        await this.auditService.record({
            userId: user.id,
            action: AuditAction.LOGIN_SUCCESS,
            metadata: { email: user.email, method: '2FA_OTP' },
        });

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: {
                id: user.id,
                email: user.email,
                isTwoFactorEnabled: true,
            },
        };
    }

    // Resend 2FA login OTP using tempToken
    async resendLoginOtp(tempTokenStr?: string) {
        if (!tempTokenStr) {
            throw new UnauthorizedException('Missing temporary 2FA authentication token.');
        }

        let payload: any;
        try {
            payload = this.jwtService.verify(tempTokenStr);
        } catch {
            throw new UnauthorizedException('Temporary 2FA session expired. Please log in again.');
        }

        if (!payload || !payload.sub || !payload.is2FA) {
            throw new UnauthorizedException('Invalid 2FA authentication token.');
        }

        const user = await this.userRepository.findOne({ where: { id: payload.sub } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // Generate new 6-digit OTP
        const rawOtp = crypto.randomInt(100000, 999999).toString();
        user.twoFactorOtpHash = this.hashData(rawOtp);
        user.twoFactorOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userRepository.save(user);

        await this.emailService.sendOtpEmail(user.email, rawOtp);

        return { message: 'Verification code resent successfully to your email' };
    }

    // Request a new 2FA OTP sent via Brevo (when logged in)
    async requestEmailOtp(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found.');

        // 1. Generate secure 6-digit numeric OTP
        const rawOtp = crypto.randomInt(100000, 999999).toString();

        // 2. Hash OTP at rest with 10-minute expiry window
        user.twoFactorOtpHash = this.hashData(rawOtp);
        user.twoFactorOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userRepository.save(user);

        // 3. Dispatch raw OTP via Brevo
        await this.emailService.sendOtpEmail(user.email, rawOtp);

        return { message: 'Verification code sent to registered email address' };
    }

    // Verify the OTP code (when enabling 2FA)
    async verifyEmailOtp(userId: string, code: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !user.twoFactorOtpHash || !user.twoFactorOtpExpiresAt) {
            throw new BadRequestException('No active OTP request found');
        }

        // 1. Check expiration
        if (new Date() > user.twoFactorOtpExpiresAt) {
            user.twoFactorOtpHash = null;
            user.twoFactorOtpExpiresAt = null;
            await this.userRepository.save(user);
            throw new UnauthorizedException('OTP has expired');
        }

        // 2. Constant-time hash comparison
        const incomingHash = this.hashData(code);
        let isValid = false;
        try {
            isValid = crypto.timingSafeEqual(
                Buffer.from(incomingHash),
                Buffer.from(user.twoFactorOtpHash),
            );
        } catch {
            isValid = (incomingHash === user.twoFactorOtpHash);
        }

        if (!isValid) {
            throw new UnauthorizedException('Invalid verification code');
        }

        // 3. Single-use invalidation
        user.twoFactorOtpHash = null;
        user.twoFactorOtpExpiresAt = null;
        user.isTwoFactorEnabled = true;
        await this.userRepository.save(user);

        return { message: 'Two-factor authentication verified successfully' };
    }

    async enable2FA(userId: string) {
        await this.userRepository.update(userId, {
            isTwoFactorEnabled: true,
        });
        return { message: 'Two-factor authentication enabled' };
    }

    async disable2FA(userId: string) {
        await this.userRepository.update(userId, {
            isTwoFactorEnabled: false,
            twoFactorOtpHash: null,
            twoFactorOtpExpiresAt: null,
        });
        return { message: 'Two-factor authentication disabled' };
    }

    async changeMasterPassword(userId: string, currentPass: string, newPass: string, newAuthSalt?: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        if (!currentPass) {
            throw new BadRequestException('Current master password is required.');
        }

        let isMatch = false;
        try {
            isMatch = await argon2.verify(user.authHash, currentPass);
        } catch {
            isMatch = (user.authHash === currentPass);
        }

        if (!isMatch) {
            throw new UnauthorizedException('Current master password does not match.');
        }

        user.authHash = await argon2.hash(newPass, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        if (newAuthSalt) {
            user.authSalt = newAuthSalt;
        }

        await this.userRepository.save(user);

        await this.auditService.record({
            userId: user.id,
            action: AuditAction.MASTER_PASSWORD_CHANGE,
            metadata: { email: user.email },
        });

        return { message: 'Master password updated successfully in database' };
    }

    // --- Refresh Token Rotation Helpers ---
    async getTokens(userId: string, email: string) {
        const payload = { sub: userId, email };
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET');

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: refreshSecret,
                expiresIn: '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }

    async updateRefreshTokenHash(userId: string, refreshToken: string) {
        const hash = await argon2.hash(refreshToken);
        await this.userRepository.update(userId, { hashedRefreshToken: hash });
    }

    async refreshTokens(userId: string, refreshTokenStr: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !user.hashedRefreshToken) {
            throw new ForbiddenException('Access Denied');
        }

        let refreshTokenMatches = false;
        try {
            refreshTokenMatches = await argon2.verify(user.hashedRefreshToken, refreshTokenStr);
        } catch {
            refreshTokenMatches = false;
        }

        if (!refreshTokenMatches) {
            // Reuse Detection: invalidate user refresh tokens immediately
            user.hashedRefreshToken = null;
            await this.userRepository.save(user);
            throw new ForbiddenException('Token reuse detected');
        }

        // Issue brand new access token and brand new refresh token (Rotation)
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
        return tokens;
    }

    async logout(userId: string) {
        await this.userRepository.update(userId, { hashedRefreshToken: null });
    }
}