import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PreLoginDto } from './dto/pre-login.dto.js';
import {
    RequestResetDto,
    ResetPasswordDto,
    RedeemRecoveryCodeDto,
} from './dto/recovery.dto.js';

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
    getProfile(@Req() req: express.Request) { // <-- Typed via the namespace import
        return req.user;
    }
    @UseGuards(JwtAuthGuard)
    @Post('2fa/request-otp')
    @HttpCode(HttpStatus.OK)
    requestOtp(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.authService.requestEmailOtp(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/verify-otp')
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Req() req: express.Request, @Body() verifyOtpDto: VerifyOtpDto) {
        const user = req.user as { id: string };
        return this.authService.verifyEmailOtp(user.id, verifyOtpDto.code);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/disable')
    @HttpCode(HttpStatus.OK)
    disable2FA(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.authService.disable2FA(user.id);
    }
    @Post('recovery/request')
    @HttpCode(HttpStatus.OK)
    requestReset(@Body() dto: RequestResetDto) {
        return this.authService.requestPasswordReset(dto);
    }

    @Post('recovery/reset')
    @HttpCode(HttpStatus.OK)
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Post('recovery/redeem-code')
    @HttpCode(HttpStatus.OK)
    redeemRecoveryCode(@Body() dto: RedeemRecoveryCodeDto) {
        return this.authService.redeemRecoveryCode(dto);
    }
}