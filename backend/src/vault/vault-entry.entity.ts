import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../auth/user.entity.js';

@Entity('vault_entries')
export class VaultEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Base64-encoded initialization vector from client AES-GCM
    @Column({ type: 'varchar', length: 64 })
    iv: string;

    // Pre-encrypted JSON stringified payload (site, username, password, notes)
    @Column({ type: 'text' })
    ciphertext: string;

    // Optional unencrypted category/tag for server-side organization and folder matching
    @Column({ type: 'varchar', length: 100, default: 'General' })
    category: string;

    // Optional unencrypted site label for rapid UI listing/filtering
    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}