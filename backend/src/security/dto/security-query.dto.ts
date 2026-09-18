import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CheckBreachPrefixDto {
    @IsString()
    @IsNotEmpty()
    @Length(5, 5, { message: 'SHA-1 prefix must be exactly 5 hex characters' })
    @Matches(/^[0-9A-Fa-f]{5}$/, {
        message: 'Prefix must be a valid 5-character hexadecimal string',
    })
    prefix: string;
}