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

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }
    async register(registerDto: RegisterDto) {
        const { email, password, authSalt } = registerDto;

        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new ConflictException('A user with this email already exists.');
        }

        const authHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        const user = this.userRepository.create({
            email,
            authHash,
            authSalt,
        });

        await this.userRepository.save(user);

        return {
            message: 'User registered successfully',
            userId: user.id,
            email: user.email,
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
    private hashData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
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