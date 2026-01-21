import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Index({ unique: true })
    @Column({ name: 'token_hash', type: 'varchar', length: 255, unique: true })
    tokenHash: string;

    @Column({ type: 'varchar', length: 255 })
    family: string;

    @Column({ name: 'is_revoked', type: 'boolean', default: false })
    isRevoked: boolean;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
    ipAddress: string | null;

    @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
    userAgent: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
