import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '@modules/orders/entities/order.entity';
import { PaymentStatus, PaymentMethod } from '@common/enums';

@Entity('payments')
@Index('idx_payments_order', ['orderId']) // Index for order payment lookups
@Index('idx_payments_status', ['status']) // Index for status filtering
@Index('idx_payments_provider', ['provider']) // Index for provider analytics
@Index('idx_payments_paid_at', ['paidAt']) // Index for payment date queries
@Index('idx_payments_created_at', ['createdAt']) // Index for sorting
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id', type: 'uuid' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.payments)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Index({ unique: true })
    @Column({ name: 'transaction_id', type: 'varchar', length: 100, unique: true })
    transactionId: string;

    @Column({ type: 'varchar', length: 50 })
    provider: string;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CREDIT_CARD,
    })
    method: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 3, default: 'USD' })
    currency: string;

    @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
    providerResponse: Record<string, unknown> | null;

    @Column({ name: 'failure_reason', type: 'varchar', length: 500, nullable: true })
    failureReason: string | null;

    @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
    paidAt: Date | null;

    @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
    refundedAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
