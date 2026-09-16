import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class RequestResetDto {
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    newPassword: string; // New client-derived auth secret

    @IsString()
    @IsNotEmpty()
    newAuthSalt: string; // New client-generated salt for domain separation
}

export class RedeemRecoveryCodeDto {
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(10, 10, { message: 'Recovery code must be exactly 10 characters' })
    code: string;
}