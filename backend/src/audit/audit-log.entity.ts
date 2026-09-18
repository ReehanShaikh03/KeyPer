import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../auth/user.entity.js';

export enum AuditAction {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    LOGOUT = 'LOGOUT',
    VAULT_CREATE = 'VAULT_CREATE',
    VAULT_UPDATE = 'VAULT_UPDATE',
    VAULT_DELETE = 'VAULT_DELETE',
    VAULT_READ = 'VAULT_READ',
    TWO_FACTOR_ENABLE = 'TWO_FACTOR_ENABLE',
    TWO_FACTOR_DISABLE = 'TWO_FACTOR_DISABLE',
    PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
    PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
}

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'enum', enum: AuditAction })
    action: AuditAction;

    @Column({ type: 'varchar', length: 64, nullable: true })
    ipAddress: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    userAgent: string | null;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any> | null;

    @Index()
    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}