import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from './user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PreLoginDto } from './dto/pre-login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
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
}