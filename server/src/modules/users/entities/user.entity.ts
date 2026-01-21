import {
    Entity,
    Column,
    OneToMany,
    Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@common/entities/base.entity';
import { UserRole } from '@common/enums';
import { RefreshToken } from '@modules/auth/entities/refresh-token.entity';
import { Cart } from '@modules/cart/entities/cart.entity';
import { Order } from '@modules/orders/entities/order.entity';

@Entity('users')
@Index('idx_users_role_active', ['role', 'isActive']) // Composite index for admin queries
@Index('idx_users_created_at', ['createdAt']) // Index for sorting by registration date
@Index('idx_users_deleted_at', ['deletedAt']) // Index for soft-delete filtering
export class User extends BaseEntity {
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Exclude()
    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ name: 'first_name', type: 'varchar', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', type: 'varchar', length: 100 })
    lastName: string;

    @Index('idx_users_phone')
    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'is_verified', type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
    emailVerifiedAt: Date | null;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt: Date | null;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, unknown> | null;

    @OneToMany(() => RefreshToken, (token) => token.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => Cart, (cart) => cart.user)
    carts: Cart[];

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
