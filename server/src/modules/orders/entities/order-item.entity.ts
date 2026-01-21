import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '@modules/products/entities/product.entity';
import { ProductVariant } from '@modules/products/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id', type: 'uuid' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'product_id', type: 'uuid', nullable: true })
    productId: string | null;

    @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product | null;

    @Column({ name: 'variant_id', type: 'uuid', nullable: true })
    variantId: string | null;

    @ManyToOne(() => ProductVariant, { nullable: true })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant | null;

    @Column({ type: 'varchar', length: 100 })
    sku: string;

    @Column({ name: 'product_name', type: 'varchar', length: 255 })
    productName: string;

    @Column({ name: 'variant_name', type: 'varchar', length: 255, nullable: true })
    variantName: string | null;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ name: 'product_snapshot', type: 'jsonb', nullable: true })
    productSnapshot: Record<string, unknown> | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
