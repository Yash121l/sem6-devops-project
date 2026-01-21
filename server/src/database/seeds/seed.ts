import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@modules/users/entities/user.entity';
import { Category } from '@modules/categories/entities/category.entity';
import { Product } from '@modules/products/entities/product.entity';
import { ProductVariant } from '@modules/products/entities/product-variant.entity';
import { Inventory } from '@modules/inventory/entities/inventory.entity';
import { Coupon } from '@modules/coupons/entities/coupon.entity';
import { UserRole, ProductStatus, DiscountType, InventoryTrackingType } from '@common/enums';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const categoryRepository = dataSource.getRepository(Category);
    const productRepository = dataSource.getRepository(Product);
    const variantRepository = dataSource.getRepository(ProductVariant);
    const inventoryRepository = dataSource.getRepository(Inventory);
    const couponRepository = dataSource.getRepository(Coupon);

    console.log('🌱 Starting database seeding...');

    // Create users
    const passwordHash = await bcrypt.hash('Password123!', 12);

    const users = [
        {
            id: uuidv4(),
            email: 'superadmin@example.com',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            isActive: true,
            isVerified: true,
            emailVerifiedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'admin@example.com',
            passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
            isActive: true,
            isVerified: true,
            emailVerifiedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'manager@example.com',
            passwordHash,
            firstName: 'Manager',
            lastName: 'User',
            role: UserRole.MANAGER,
            isActive: true,
            isVerified: true,
            emailVerifiedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'customer@example.com',
            passwordHash,
            firstName: 'John',
            lastName: 'Customer',
            role: UserRole.CUSTOMER,
            isActive: true,
            isVerified: true,
            emailVerifiedAt: new Date(),
        },
    ];

    for (const userData of users) {
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });
        if (!existingUser) {
            await userRepository.save(userRepository.create(userData));
            console.log(`  ✓ Created user: ${userData.email}`);
        }
    }

    // Create categories
    const categories = [
        { id: uuidv4(), name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', sortOrder: 1 },
        { id: uuidv4(), name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items', sortOrder: 2 },
        { id: uuidv4(), name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and garden supplies', sortOrder: 3 },
        { id: uuidv4(), name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories', sortOrder: 4 },
    ];

    const savedCategories: Category[] = [];
    for (const categoryData of categories) {
        const existingCategory = await categoryRepository.findOne({ where: { slug: categoryData.slug } });
        if (!existingCategory) {
            const saved = await categoryRepository.save(categoryRepository.create(categoryData));
            savedCategories.push(saved);
            console.log(`  ✓ Created category: ${categoryData.name}`);
        } else {
            savedCategories.push(existingCategory);
        }
    }

    // Create products
    const products = [
        {
            sku: 'ELEC-001',
            name: 'Premium Wireless Headphones',
            slug: 'premium-wireless-headphones',
            description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
            shortDescription: 'Premium noise-cancelling wireless headphones',
            basePrice: 199.99,
            compareAtPrice: 249.99,
            costPrice: 80.00,
            categoryId: savedCategories[0]?.id,
            status: ProductStatus.ACTIVE,
            isFeatured: true,
            images: ['headphones-1.jpg', 'headphones-2.jpg'],
        },
        {
            sku: 'ELEC-002',
            name: 'Smart Watch Pro',
            slug: 'smart-watch-pro',
            description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
            shortDescription: 'Feature-rich smartwatch',
            basePrice: 349.99,
            compareAtPrice: 399.99,
            costPrice: 150.00,
            categoryId: savedCategories[0]?.id,
            status: ProductStatus.ACTIVE,
            isFeatured: true,
            images: ['smartwatch-1.jpg'],
        },
        {
            sku: 'CLOTH-001',
            name: 'Classic Cotton T-Shirt',
            slug: 'classic-cotton-tshirt',
            description: 'Soft, breathable 100% cotton t-shirt perfect for everyday wear.',
            shortDescription: 'Comfortable cotton t-shirt',
            basePrice: 29.99,
            categoryId: savedCategories[1]?.id,
            status: ProductStatus.ACTIVE,
            isFeatured: false,
            images: ['tshirt-1.jpg'],
        },
        {
            sku: 'HOME-001',
            name: 'Minimalist Desk Lamp',
            slug: 'minimalist-desk-lamp',
            description: 'Modern LED desk lamp with adjustable brightness and color temperature.',
            shortDescription: 'Adjustable LED desk lamp',
            basePrice: 59.99,
            compareAtPrice: 79.99,
            costPrice: 25.00,
            categoryId: savedCategories[2]?.id,
            status: ProductStatus.ACTIVE,
            isFeatured: true,
            images: ['lamp-1.jpg'],
        },
        {
            sku: 'SPORT-001',
            name: 'Professional Yoga Mat',
            slug: 'professional-yoga-mat',
            description: 'Premium non-slip yoga mat with extra cushioning for comfort.',
            shortDescription: 'Non-slip yoga mat',
            basePrice: 49.99,
            categoryId: savedCategories[3]?.id,
            status: ProductStatus.ACTIVE,
            isFeatured: false,
            images: ['yogamat-1.jpg'],
        },
    ];

    for (const productData of products) {
        const existingProduct = await productRepository.findOne({ where: { sku: productData.sku } });
        if (!existingProduct) {
            const product = await productRepository.save(productRepository.create(productData));
            console.log(`  ✓ Created product: ${productData.name}`);

            // Create default variant
            const variant = await variantRepository.save(
                variantRepository.create({
                    productId: product.id,
                    sku: `${productData.sku}-DEFAULT`,
                    name: 'Default',
                    price: productData.basePrice,
                    costPrice: productData.costPrice,
                    isDefault: true,
                }),
            );

            // Create inventory
            await inventoryRepository.save(
                inventoryRepository.create({
                    variantId: variant.id,
                    quantity: Math.floor(Math.random() * 100) + 50,
                    lowStockThreshold: 10,
                    trackingType: InventoryTrackingType.TRACK,
                    lastRestockedAt: new Date(),
                }),
            );
        }
    }

    // Create coupons
    const coupons = [
        {
            code: 'WELCOME10',
            name: 'Welcome Discount',
            description: '10% off your first order',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 10,
            minPurchaseAmount: 50,
            usageLimit: 1000,
            isActive: true,
        },
        {
            code: 'SUMMER20',
            name: 'Summer Sale',
            description: '20% off summer collection',
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            minPurchaseAmount: 100,
            maxDiscountAmount: 50,
            usageLimit: 500,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            isActive: true,
        },
        {
            code: 'FLAT15',
            name: 'Flat $15 Off',
            description: '$15 off orders over $75',
            discountType: DiscountType.FIXED,
            discountValue: 15,
            minPurchaseAmount: 75,
            usageLimit: 200,
            isActive: true,
        },
    ];

    for (const couponData of coupons) {
        const existingCoupon = await couponRepository.findOne({ where: { code: couponData.code } });
        if (!existingCoupon) {
            await couponRepository.save(couponRepository.create(couponData));
            console.log(`  ✓ Created coupon: ${couponData.code}`);
        }
    }

    console.log('✅ Database seeding completed!');
}
