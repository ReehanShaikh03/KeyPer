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

    @Column({ type: 'varchar', nullable: true })
    twoFactorOtpHash: string | null;

    @Column({ type: 'timestamp', nullable: true })
    twoFactorOtpExpiresAt: Date | null;

    // --- Day 5 Additions ---
    @Column({ type: 'varchar', nullable: true })
    resetPasswordTokenHash: string | null;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpiresAt: Date | null;

    // Stored as an array of SHA-256 hashed strings
    @Column('text', { array: true, default: '{}' })
    recoveryCodesHash: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}