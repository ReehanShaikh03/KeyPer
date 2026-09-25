import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
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

const REFRESH_COOKIE_OPTIONS: express.CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshTokenCookie(res: express.Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshTokenCookie(res: express.Response) {
    res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
}

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
    async login(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
        @Body() loginDto: LoginDto,
    ) {
        const result = await this.authService.login(
            loginDto,
            req.ip,
            req.headers['user-agent'] as string,
        );
        if ('refreshToken' in result && result.refreshToken) {
            setRefreshTokenCookie(res, result.refreshToken);
            delete (result as any).refreshToken;
        }
        return result;
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
    async verifyLoginOtp(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
        @Body() body: { code: string; tempToken?: string },
    ) {
        const authHeader = req.headers['authorization'];
        const tempToken = body.tempToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);
        const result = await this.authService.verifyLoginOtp(body.code, tempToken);
        if ('refreshToken' in result && result.refreshToken) {
            setRefreshTokenCookie(res, result.refreshToken);
            delete (result as any).refreshToken;
        }
        return result;
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

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const user = req.user as { id: string; refreshToken: string };
        try {
            const tokens = await this.authService.refreshTokens(user.id, user.refreshToken);
            setRefreshTokenCookie(res, tokens.refreshToken);
            return { accessToken: tokens.accessToken };
        } catch (err) {
            clearRefreshTokenCookie(res);
            throw err;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const user = req.user as { id: string };
        await this.authService.logout(user.id);
        clearRefreshTokenCookie(res);
        return { message: 'Logged out successfully' };
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
    async redeemRecoveryCode(
        @Res({ passthrough: true }) res: express.Response,
        @Body() dto: RedeemRecoveryCodeDto,
    ) {
        const result = await this.authService.redeemRecoveryCode(dto);
        if ('refreshToken' in result && result.refreshToken) {
            setRefreshTokenCookie(res, result.refreshToken);
            delete (result as any).refreshToken;
        }
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-master-password')
    @HttpCode(HttpStatus.OK)
    changeMasterPassword(@Req() req: express.Request, @Body() body: { currentPassword?: string; newPassword?: string; newAuthSalt?: string }) {
        const user = req.user as { id: string };
        return this.authService.changeMasterPassword(user.id, body.currentPassword || '', body.newPassword || '', body.newAuthSalt);
    }
}