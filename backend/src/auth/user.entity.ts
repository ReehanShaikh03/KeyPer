import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    authHash: string;

    @Column()
    authSalt: string;

    @Column({ default: false })
    isTwoFactorEnabled: boolean;

    // New columns for Brevo Email 2FA OTP
    @Column({ type: 'varchar', nullable: true })
    twoFactorOtpHash: string | null;

    @Column({ type: 'timestamp', nullable: true })
    twoFactorOtpExpiresAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}