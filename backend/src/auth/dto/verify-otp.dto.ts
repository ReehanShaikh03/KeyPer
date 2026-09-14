import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    code: string;
}