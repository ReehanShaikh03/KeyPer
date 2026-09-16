import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVaultEntryDto {
    @IsString()
    @IsNotEmpty({ message: 'IV is required for AES-GCM payloads' })
    @MaxLength(64)
    iv: string;

    @IsString()
    @IsNotEmpty({ message: 'Ciphertext cannot be empty' })
    ciphertext: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    category?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;
}