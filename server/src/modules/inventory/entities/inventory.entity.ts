import {
    Entity,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    Index,
} from 'typeorm';
import { ProductVariant } from '@modules/products/entities/product-variant.entity';
import { InventoryTrackingType } from '@common/enums';

@Entity('inventory')
@Index('idx_inventory_quantity', ['quantity']) // Index for low-stock alerts
@Index('idx_inventory_tracking_type', ['trackingType']) // Index for tracking type filtering
@Index('idx_inventory_low_stock', ['quantity', 'lowStockThreshold']) // Composite for low-stock queries
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ name: 'variant_id', type: 'uuid', unique: true })
    variantId: string;

    @OneToOne(() => ProductVariant, (variant) => variant.inventory)
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;

    @Column({ type: 'int', default: 0 })
    quantity: number;

    @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
    reservedQuantity: number;

    @Column({ name: 'low_stock_threshold', type: 'int', default: 10 })
    lowStockThreshold: number;

    @Column({
        name: 'tracking_type',
        type: 'enum',
        enum: InventoryTrackingType,
        default: InventoryTrackingType.TRACK,
    })
    trackingType: InventoryTrackingType;

    @Column({ name: 'allow_backorder', type: 'boolean', default: false })
    allowBackorder: boolean;

    @Column({ name: 'last_restocked_at', type: 'timestamp', nullable: true })
    lastRestockedAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    get availableQuantity(): number {
        return this.quantity - this.reservedQuantity;
    }

    get isLowStock(): boolean {
        return this.availableQuantity <= this.lowStockThreshold;
    }

    get isOutOfStock(): boolean {
        return this.availableQuantity <= 0 && !this.allowBackorder;
    }
}
