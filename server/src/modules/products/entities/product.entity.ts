import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ProductStatus } from '@common/enums';
import { Category } from '@modules/categories/entities/category.entity';
import { ProductVariant } from './product-variant.entity';
import { CartItem } from '@modules/cart/entities/cart-item.entity';
import { OrderItem } from '@modules/orders/entities/order-item.entity';

@Entity('products')
@Index('idx_products_status_featured', ['status', 'isFeatured']) // Composite for homepage/featured products
@Index('idx_products_category', ['categoryId']) // Index for category browsing
@Index('idx_products_status', ['status']) // Index for status filtering
@Index('idx_products_created_at', ['createdAt']) // Index for sorting by newest
@Index('idx_products_base_price', ['basePrice']) // Index for price range filtering
@Index('idx_products_deleted_at', ['deletedAt']) // Index for soft-delete filtering
export class Product extends BaseEntity {
    @Column({ name: 'category_id', type: 'uuid', nullable: true })
    categoryId: string | null;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Category | null;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100, unique: true })
    sku: string;

    @Index('idx_products_name')
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
    shortDescription: string | null;

    @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
    basePrice: number;

    @Column({ name: 'compare_at_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    compareAtPrice: number | null;

    @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    costPrice: number | null;

    @Column({ type: 'jsonb', nullable: true })
    images: string[] | null;

    @Column({ type: 'jsonb', nullable: true })
    attributes: Record<string, unknown> | null;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.DRAFT,
    })
    status: ProductStatus;

    @Column({ name: 'is_featured', type: 'boolean', default: false })
    isFeatured: boolean;

    @Column({ name: 'is_taxable', type: 'boolean', default: true })
    isTaxable: boolean;

    @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
    weight: number | null;

    @Column({ name: 'weight_unit', type: 'varchar', length: 10, default: 'kg' })
    weightUnit: string;

    @Column({ type: 'jsonb', nullable: true })
    dimensions: {
        length?: number;
        width?: number;
        height?: number;
        unit?: string;
    } | null;

    @Column({ name: 'seo_metadata', type: 'jsonb', nullable: true })
    seoMetadata: {
        title?: string;
        description?: string;
        keywords?: string[];
    } | null;

    @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
    variants: ProductVariant[];

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];
}
