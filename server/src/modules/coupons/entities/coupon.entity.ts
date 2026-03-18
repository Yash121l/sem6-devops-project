import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { DiscountType } from '@common/enums';

@Entity('coupons')
@Index('idx_coupons_active', ['isActive']) // Index for active coupon filtering
@Index('idx_coupons_dates', ['startsAt', 'expiresAt']) // Composite for date-based validity
@Index('idx_coupons_discount_type', ['discountType']) // Index for discount type filtering
@Index('idx_coupons_usage', ['usageCount', 'usageLimit']) // Composite for usage tracking
@Index('idx_coupons_deleted_at', ['deletedAt']) // Index for soft-delete filtering
export class Coupon extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'min_purchase_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number | null;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number | null;

  @Column({ name: 'usage_limit', type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'per_user_limit', type: 'int', nullable: true })
  perUserLimit: number | null;

  @Column({ name: 'starts_at', type: 'timestamp', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    categoryIds?: string[];
    productIds?: string[];
    userIds?: string[];
    minItems?: number;
  } | null;
}
