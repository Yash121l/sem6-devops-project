import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    Index,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { AuditAction } from '@common/enums';

@Entity('audit_logs')
@Index('idx_audit_entity', ['entityType', 'entityId']) // Composite for entity history queries
@Index('idx_audit_user_action', ['userId', 'action']) // Composite for user activity tracking
@Index('idx_audit_created_at', ['createdAt']) // Index for time-based queries
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('idx_audit_user_id')
    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Index('idx_audit_action')
    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Index('idx_audit_entity_type')
    @Column({ name: 'entity_type', type: 'varchar', length: 100 })
    entityType: string;

    @Index('idx_audit_entity_id')
    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    entityId: string | null;

    @Column({ name: 'old_values', type: 'jsonb', nullable: true })
    oldValues: Record<string, unknown> | null;

    @Column({ name: 'new_values', type: 'jsonb', nullable: true })
    newValues: Record<string, unknown> | null;

    @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
    ipAddress: string | null;

    @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
    userAgent: string | null;

    @Index('idx_audit_request_id')
    @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true })
    requestId: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
