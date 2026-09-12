import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './user.entity.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, authSalt } = registerDto;

        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new ConflictException('A user with this email already exists.');
        }

        // Argon2id hashing with recommended memory/time parameters
        const authHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,       // 3 iterations
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
}