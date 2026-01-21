import {
    Entity,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Inventory } from '@modules/inventory/entities/inventory.entity';

@Entity('product_variants')
export class ProductVariant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100, unique: true })
    sku: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    costPrice: number | null;

    @Column({ type: 'jsonb', nullable: true })
    attributes: Record<string, unknown> | null;

    @Column({ type: 'jsonb', nullable: true })
    images: string[] | null;

    @Column({ name: 'is_default', type: 'boolean', default: false })
    isDefault: boolean;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @OneToOne(() => Inventory, (inventory) => inventory.variant)
    inventory: Inventory;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
