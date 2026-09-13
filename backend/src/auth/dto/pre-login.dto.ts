import { IsEmail, IsNotEmpty } from 'class-validator';

export class PreLoginDto {
    @IsEmail({}, { message: 'Invalid email address' })
    @IsNotEmpty()
    email: string;
}