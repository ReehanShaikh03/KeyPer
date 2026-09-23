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
import { Throttle } from '@nestjs/throttler';
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
    @Throttle({ long: { limit: 5, ttl: 60000 } })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Req() req: express.Request, @Body() loginDto: LoginDto) {
        return this.authService.login(
            loginDto,
            req.ip,
            req.headers['user-agent'] as string,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: express.Request) { // <-- Typed via the namespace import
        return req.user;
    }
    @UseGuards(JwtAuthGuard)
    @Throttle({ long: { limit: 3, ttl: 60000 } })
    @Post('2fa/request-otp')
    @HttpCode(HttpStatus.OK)
    requestOtp(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.authService.requestEmailOtp(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Throttle({ long: { limit: 5, ttl: 60000 } })
    @Post('2fa/verify-otp')
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Req() req: express.Request, @Body() verifyOtpDto: VerifyOtpDto) {
        const user = req.user as { id: string };
        return this.authService.verifyEmailOtp(user.id, verifyOtpDto.code);
    }

    @Throttle({ long: { limit: 5, ttl: 60000 } })
    @Post('2fa/verify-login-otp')
    @HttpCode(HttpStatus.OK)
    verifyLoginOtp(
        @Req() req: express.Request,
        @Body() body: { code: string; tempToken?: string },
    ) {
        const authHeader = req.headers['authorization'];
        const tempToken = body.tempToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);
        return this.authService.verifyLoginOtp(body.code, tempToken);
    }

    @Throttle({ long: { limit: 3, ttl: 60000 } })
    @Post('2fa/resend-otp')
    @HttpCode(HttpStatus.OK)
    resendLoginOtp(
        @Req() req: express.Request,
        @Body() body: { tempToken?: string },
    ) {
        const authHeader = req.headers['authorization'];
        const tempToken = body.tempToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);
        return this.authService.resendLoginOtp(tempToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/enable')
    @HttpCode(HttpStatus.OK)
    enable2FA(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.authService.enable2FA(user.id);
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

    @UseGuards(JwtAuthGuard)
    @Post('change-master-password')
    @HttpCode(HttpStatus.OK)
    changeMasterPassword(@Req() req: express.Request, @Body() body: { currentPassword?: string; newPassword?: string; newAuthSalt?: string }) {
        const user = req.user as { id: string };
        return this.authService.changeMasterPassword(user.id, body.currentPassword || '', body.newPassword || '', body.newAuthSalt);
    }
}