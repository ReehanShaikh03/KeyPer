import {
    BadRequestException,
    ConflictException,
    Injectable,
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
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
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

        // Issue temporary JWT session
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        return {
            message: 'Recovery code accepted. Configure your new credentials immediately.',
            remainingCodes: user.recoveryCodesHash.length,
            accessToken,
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

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        const isMatch = await argon2.verify(user.authHash, password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: {
                id: user.id,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            },
        };
    }

    // Request a new 2FA OTP sent via Brevo
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

    // Verify the OTP code
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
        const isValid = crypto.timingSafeEqual(
            Buffer.from(incomingHash),
            Buffer.from(user.twoFactorOtpHash),
        );

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

    async disable2FA(userId: string) {
        await this.userRepository.update(userId, {
            isTwoFactorEnabled: false,
            twoFactorOtpHash: null,
            twoFactorOtpExpiresAt: null,
        });
        return { message: 'Two-factor authentication disabled' };
    }
}