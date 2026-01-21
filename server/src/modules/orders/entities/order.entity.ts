import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus, PaymentStatus } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '@modules/payments/entities/payment.entity';
import { Coupon } from '@modules/coupons/entities/coupon.entity';

@Entity('orders')
@Index('idx_orders_user_status', ['userId', 'status']) // Composite index for user order filtering
@Index('idx_orders_placed_at', ['placedAt']) // Index for date range queries
@Index('idx_orders_status', ['status']) // Index for status filtering
@Index('idx_orders_payment_status', ['paymentStatus']) // Index for payment status filtering
@Index('idx_orders_created_at', ['createdAt']) // Index for sorting
export class Order extends BaseEntity {
    @Index({ unique: true })
    @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
    orderNumber: string;

    @Index('idx_orders_user_id')
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
    couponId: string | null;

    @ManyToOne(() => Coupon, { nullable: true })
    @JoinColumn({ name: 'coupon_id' })
    coupon: Coupon | null;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ name: 'shipping_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
    billingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
    } | null;

    @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
    shippingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
    } | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'internal_notes', type: 'text', nullable: true })
    internalNotes: string | null;

    @Column({ name: 'placed_at', type: 'timestamp', nullable: true })
    placedAt: Date | null;

    @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
    shippedAt: Date | null;

    @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
    deliveredAt: Date | null;

    @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
    cancelledAt: Date | null;

    @Column({ name: 'cancellation_reason', type: 'varchar', length: 500, nullable: true })
    cancellationReason: string | null;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, unknown> | null;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @OneToMany(() => Payment, (payment) => payment.order)
    payments: Payment[];
}
