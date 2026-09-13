import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request as Req, // Alias to avoid clashing with Express Request type
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express'; // <-- Import Express Request
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PreLoginDto } from './dto/pre-login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('pre-login')
    @HttpCode(HttpStatus.OK)
    getPreLoginSalt(@Body() preLoginDto: PreLoginDto) {
        return this.authService.getPreLoginSalt(preLoginDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: { user: any }) {
        return req.user;
    }
}