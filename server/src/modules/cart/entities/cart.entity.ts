import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { CartItem } from './cart-item.entity';
import { Coupon } from '@modules/coupons/entities/coupon.entity';

@Entity('carts')
@Index('idx_carts_user', ['userId']) // Index for user cart lookups
@Index('idx_carts_expires', ['expiresAt']) // Index for cart expiration cleanup
@Index('idx_carts_updated', ['updatedAt']) // Index for abandoned cart queries
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string | null;

    @ManyToOne(() => User, (user) => user.carts, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Index({ unique: true })
    @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true, unique: true })
    sessionId: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total: number;

    @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
    couponId: string | null;

    @ManyToOne(() => Coupon, { nullable: true })
    @JoinColumn({ name: 'coupon_id' })
    coupon: Coupon | null;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, unknown> | null;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date | null;

    @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
    items: CartItem[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
