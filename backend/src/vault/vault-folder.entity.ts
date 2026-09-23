import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('vault_folders')
@Unique(['userId', 'name'])
export class VaultFolder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @CreateDateColumn()
    createdAt: Date;
}
