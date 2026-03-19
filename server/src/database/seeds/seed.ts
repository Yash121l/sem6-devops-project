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

  // ─── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = [
    {
      id: uuidv4(),
      email: 'superadmin@shopsmart.dev',
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
      email: 'admin@shopsmart.dev',
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
      email: 'customer@shopsmart.dev',
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

  // ─── Categories ─────────────────────────────────────────────────────────────
  // Slugs match the frontend demo data category IDs exactly
  const categoryDefs = [
    {
      slug: 'electronics',
      name: 'Electronics',
      description: 'Latest gadgets and cutting-edge technology',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
      sortOrder: 1,
      metadata: {
        subcategories: ['Headphones', 'Smartwatches', 'Speakers', 'Chargers', 'Cameras'],
      },
    },
    {
      slug: 'clothing',
      name: 'Clothing',
      description: 'Fashion-forward apparel for every occasion',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
      sortOrder: 2,
      metadata: {
        subcategories: ['T-Shirts', 'Jackets', 'Pants', 'Dresses', 'Shoes', 'Activewear'],
      },
    },
    {
      slug: 'accessories',
      name: 'Accessories',
      description: 'Complete your look with premium accessories',
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600',
      sortOrder: 3,
      metadata: {
        subcategories: ['Bags', 'Watches', 'Sunglasses', 'Jewelry', 'Belts', 'Scarves'],
      },
    },
    {
      slug: 'home',
      name: 'Home & Living',
      description: 'Transform your space into a sanctuary',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600',
      sortOrder: 4,
      metadata: {
        subcategories: ['Decor', 'Furniture', 'Lighting', 'Bedding', 'Kitchen', 'Storage'],
      },
    },
    {
      slug: 'food',
      name: 'Food & Beverage',
      description: 'Artisan food and drinks for connoisseurs',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
      sortOrder: 5,
      metadata: {
        subcategories: ['Coffee', 'Tea', 'Snacks', 'Gourmet', 'Organic'],
      },
    },
    {
      slug: 'beauty',
      name: 'Beauty & Care',
      description: 'Self-care essentials and beauty products',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
      sortOrder: 6,
      metadata: {
        subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Tools'],
      },
    },
  ];

  const categoryMap: Record<string, Category> = {};
  for (const cat of categoryDefs) {
    let existing = await categoryRepository.findOne({ where: { slug: cat.slug } });
    if (!existing) {
      existing = await categoryRepository.save(
        categoryRepository.create({ id: uuidv4(), isActive: true, ...cat }),
      );
      console.log(`  ✓ Created category: ${cat.name}`);
    } else if (!existing.imageUrl) {
      existing.imageUrl = cat.imageUrl;
      existing.metadata = cat.metadata as Record<string, unknown>;
      await categoryRepository.save(existing);
    }
    categoryMap[cat.slug] = existing;
  }

  // ─── Products ────────────────────────────────────────────────────────────────
  // Slugs and data match frontend demo data (client/src/data/products.js) exactly
  const productDefs = [
    {
      sku: 'ELEC-WH-001',
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      shortDescription: 'Experience crystal-clear audio with our flagship noise-cancelling headphones.',
      description:
        'Immerse yourself in pure sound with our Premium Wireless Headphones. Featuring advanced active noise cancellation, 40mm custom drivers, and up to 30 hours of battery life. The premium memory foam ear cushions provide all-day comfort while the sleek aluminum construction ensures durability.',
      basePrice: 249.99,
      compareAtPrice: 349.99,
      costPrice: 100.0,
      categorySlug: 'electronics',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
      ],
      attributes: {
        rating: 4.8,
        reviewCount: 1247,
        colors: [
          { name: 'Midnight Black', hex: '#1a1a1a' },
          { name: 'Pearl White', hex: '#f5f5f5' },
          { name: 'Rose Gold', hex: '#b76e79' },
        ],
        tags: ['wireless', 'noise-cancelling', 'premium'],
        isBestseller: true,
        soldThisWeek: 847,
      },
      stock: 3,
    },
    {
      sku: 'ACC-LM-002',
      name: 'Classic Leather Messenger Bag',
      slug: 'classic-leather-messenger-bag',
      shortDescription: 'Handcrafted genuine leather bag perfect for professionals.',
      description:
        'Our Classic Leather Messenger Bag combines timeless style with modern functionality. Made from full-grain leather that develops a beautiful patina over time. Features include a padded laptop compartment, multiple organizer pockets, and an adjustable shoulder strap.',
      basePrice: 189.0,
      compareAtPrice: null,
      costPrice: 75.0,
      categorySlug: 'accessories',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
      ],
      attributes: {
        rating: 4.6,
        reviewCount: 523,
        colors: [
          { name: 'Cognac Brown', hex: '#8b4513' },
          { name: 'Black', hex: '#1a1a1a' },
        ],
        tags: ['leather', 'professional', 'handcrafted'],
        isBestseller: true,
        soldThisWeek: 312,
      },
      stock: 15,
    },
    {
      sku: 'CLOTH-OC-003',
      name: 'Organic Cotton T-Shirt',
      slug: 'organic-cotton-tshirt',
      shortDescription: 'Soft, sustainable, and incredibly comfortable everyday essential.',
      description:
        'Made from 100% GOTS-certified organic cotton, this t-shirt is gentle on your skin and the environment. Pre-shrunk fabric with reinforced seams for long-lasting wear. The relaxed fit and breathable material make it perfect for any occasion.',
      basePrice: 34.99,
      compareAtPrice: 44.99,
      costPrice: 12.0,
      categorySlug: 'clothing',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
      ],
      attributes: {
        rating: 4.5,
        reviewCount: 892,
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'White', hex: '#ffffff' },
          { name: 'Navy', hex: '#1e3a5f' },
          { name: 'Heather Gray', hex: '#9ca3af' },
          { name: 'Black', hex: '#1a1a1a' },
        ],
        tags: ['organic', 'sustainable', 'cotton'],
        isBestseller: false,
        soldThisWeek: 423,
      },
      stock: 50,
    },
    {
      sku: 'ELEC-SW-004',
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      shortDescription: 'Track your health and fitness with precision and style.',
      description:
        'Take control of your health with our Smart Fitness Watch. Features include 24/7 heart rate monitoring, GPS tracking, sleep analysis, and 100+ workout modes. Water-resistant up to 50m with a stunning AMOLED display. Battery lasts up to 14 days.',
      basePrice: 299.0,
      compareAtPrice: 399.0,
      costPrice: 120.0,
      categorySlug: 'electronics',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',
      ],
      attributes: {
        rating: 4.7,
        reviewCount: 2156,
        sizes: ['S', 'M', 'L'],
        colors: [
          { name: 'Space Gray', hex: '#4a4a4a' },
          { name: 'Silver', hex: '#c0c0c0' },
          { name: 'Rose Gold', hex: '#b76e79' },
        ],
        tags: ['fitness', 'smartwatch', 'health'],
        isBestseller: true,
        soldThisWeek: 1089,
      },
      stock: 8,
    },
    {
      sku: 'HOME-CV-005',
      name: 'Minimalist Ceramic Vase Set',
      slug: 'minimalist-ceramic-vase-set',
      shortDescription: 'Elevate your space with these handcrafted artisan vases.',
      description:
        'This set of three handcrafted ceramic vases adds a touch of modern elegance to any room. Each piece is uniquely glazed by skilled artisans. The varying heights and shapes create visual interest while maintaining a cohesive minimalist aesthetic.',
      basePrice: 79.99,
      compareAtPrice: null,
      costPrice: 28.0,
      categorySlug: 'home',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600',
        'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600',
      ],
      attributes: {
        rating: 4.9,
        reviewCount: 178,
        colors: [
          { name: 'Matte White', hex: '#f5f5f5' },
          { name: 'Sage Green', hex: '#9caf88' },
          { name: 'Terracotta', hex: '#e07a5f' },
        ],
        tags: ['handcrafted', 'ceramic', 'decor'],
        isBestseller: false,
        soldThisWeek: 67,
      },
      stock: 12,
    },
    {
      sku: 'CLOTH-RS-006',
      name: 'Performance Running Shoes',
      slug: 'performance-running-shoes',
      shortDescription: 'Engineered for speed, comfort, and endurance.',
      description:
        'Designed with input from elite athletes, these running shoes feature responsive cushioning, a breathable mesh upper, and a durable rubber outsole. The lightweight construction reduces fatigue while the heel counter provides stability on every stride.',
      basePrice: 159.99,
      compareAtPrice: 199.99,
      costPrice: 65.0,
      categorySlug: 'clothing',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
      ],
      attributes: {
        rating: 4.4,
        reviewCount: 634,
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
        colors: [
          { name: 'Volt Yellow', hex: '#ccff00' },
          { name: 'Core Black', hex: '#1a1a1a' },
          { name: 'Cloud White', hex: '#ffffff' },
        ],
        tags: ['running', 'athletic', 'performance'],
        isBestseller: true,
        soldThisWeek: 521,
      },
      stock: 25,
    },
    {
      sku: 'FOOD-CB-007',
      name: 'Artisan Coffee Blend',
      slug: 'artisan-coffee-blend',
      shortDescription: 'Single-origin beans roasted to perfection.',
      description:
        'Our signature blend combines beans from the highlands of Colombia and Ethiopia, creating a smooth, balanced cup with notes of dark chocolate, caramel, and citrus. Small-batch roasted weekly for peak freshness. 12oz bag.',
      basePrice: 24.99,
      compareAtPrice: null,
      costPrice: 8.0,
      categorySlug: 'food',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
      ],
      attributes: {
        rating: 4.8,
        reviewCount: 1567,
        tags: ['coffee', 'artisan', 'organic'],
        isBestseller: true,
        soldThisWeek: 892,
      },
      stock: 100,
    },
    {
      sku: 'HOME-SC-008',
      name: 'Luxury Scented Candle Set',
      slug: 'luxury-scented-candle-set',
      shortDescription: 'Transform your home with these hand-poured soy candles.',
      description:
        'This collection of three luxury candles features calming scents: Lavender & Eucalyptus, Vanilla & Sandalwood, and Fresh Linen. Made with 100% soy wax and cotton wicks for a clean, long-lasting burn of 45+ hours each.',
      basePrice: 54.99,
      compareAtPrice: 74.99,
      costPrice: 20.0,
      categorySlug: 'home',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1602607663458-63eb47d3c56b?w=600',
        'https://images.unsplash.com/photo-1603905179682-f5e1a0a73e42?w=600',
      ],
      attributes: {
        rating: 4.6,
        reviewCount: 445,
        tags: ['candles', 'aromatherapy', 'soy'],
        isBestseller: false,
        soldThisWeek: 234,
      },
      stock: 35,
    },
    {
      sku: 'ACC-SG-009',
      name: 'Designer Sunglasses',
      slug: 'designer-sunglasses',
      shortDescription: 'Italian-crafted frames with polarized UV protection.',
      description:
        'These designer sunglasses feature hand-polished acetate frames crafted in Italy. The polarized lenses offer 100% UV protection while reducing glare for crystal-clear vision. Includes a premium leather case and cleaning cloth.',
      basePrice: 195.0,
      compareAtPrice: 245.0,
      costPrice: 80.0,
      categorySlug: 'accessories',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600',
      ],
      attributes: {
        rating: 4.5,
        reviewCount: 289,
        colors: [
          { name: 'Tortoise', hex: '#8b4513' },
          { name: 'Jet Black', hex: '#1a1a1a' },
          { name: 'Crystal Clear', hex: '#e8e8e8' },
        ],
        tags: ['sunglasses', 'designer', 'italian'],
        isBestseller: false,
        soldThisWeek: 156,
      },
      stock: 18,
    },
    {
      sku: 'ELEC-WC-010',
      name: 'Wireless Charging Pad',
      slug: 'wireless-charging-pad',
      shortDescription: 'Fast wireless charging for all Qi-enabled devices.',
      description:
        'Charge your devices effortlessly with our sleek wireless charging pad. Supports up to 15W fast charging, compatible with all Qi-enabled devices. The non-slip surface and LED indicator make it perfect for your nightstand or desk.',
      basePrice: 39.99,
      compareAtPrice: 49.99,
      costPrice: 15.0,
      categorySlug: 'electronics',
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=600'],
      attributes: {
        rating: 4.3,
        reviewCount: 756,
        colors: [
          { name: 'Black', hex: '#1a1a1a' },
          { name: 'White', hex: '#ffffff' },
        ],
        tags: ['wireless', 'charging', 'tech'],
        isBestseller: false,
        soldThisWeek: 445,
      },
      stock: 60,
    },
    {
      sku: 'CLOTH-DJ-011',
      name: 'Denim Jacket Classic',
      slug: 'denim-jacket-classic',
      shortDescription: 'Timeless denim jacket with modern detailing.',
      description:
        'A wardrobe essential that never goes out of style. Made from premium cotton denim with just the right amount of stretch for comfort. Features antique brass buttons, multiple pockets, and a slightly cropped fit that works with any outfit.',
      basePrice: 89.99,
      compareAtPrice: 119.99,
      costPrice: 35.0,
      categorySlug: 'clothing',
      isFeatured: true,
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'],
      attributes: {
        rating: 4.7,
        reviewCount: 412,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Light Wash', hex: '#a4c2d7' },
          { name: 'Dark Indigo', hex: '#1e3a5f' },
        ],
        tags: ['denim', 'jacket', 'classic'],
        isBestseller: true,
        soldThisWeek: 287,
      },
      stock: 22,
    },
    {
      sku: 'ACC-YM-012',
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      shortDescription: 'Non-slip, eco-friendly mat for your practice.',
      description:
        'Elevate your yoga practice with our premium mat. Made from natural rubber with a microfiber suede surface that grips better when wet. 6mm thickness provides excellent cushioning while maintaining stability. Includes carrying strap.',
      basePrice: 68.0,
      compareAtPrice: null,
      costPrice: 25.0,
      categorySlug: 'accessories',
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600'],
      attributes: {
        rating: 4.8,
        reviewCount: 567,
        colors: [
          { name: 'Deep Purple', hex: '#4a0080' },
          { name: 'Ocean Blue', hex: '#006994' },
          { name: 'Forest Green', hex: '#228b22' },
          { name: 'Dusty Rose', hex: '#dcae96' },
        ],
        tags: ['yoga', 'fitness', 'eco-friendly'],
        isBestseller: false,
        soldThisWeek: 198,
      },
      stock: 40,
    },
  ];

  for (const productDef of productDefs) {
    const existingProduct = await productRepository.findOne({
      where: { sku: productDef.sku },
    });
    if (existingProduct) continue;

    const { categorySlug, stock, ...productData } = productDef;
    const category = categoryMap[categorySlug];

    const product = await productRepository.save(
      productRepository.create({
        id: uuidv4(),
        ...productData,
        categoryId: category?.id,
        status: ProductStatus.ACTIVE,
      }),
    );
    console.log(`  ✓ Created product: ${productDef.name}`);

    const variant = await variantRepository.save(
      variantRepository.create({
        id: uuidv4(),
        productId: product.id,
        sku: `${productDef.sku}-DEFAULT`,
        name: 'Default',
        price: productDef.basePrice,
        costPrice: productDef.costPrice,
        isDefault: true,
      }),
    );

    await inventoryRepository.save(
      inventoryRepository.create({
        id: uuidv4(),
        variantId: variant.id,
        quantity: stock,
        reservedQuantity: 0,
        lowStockThreshold: 5,
        trackingType: InventoryTrackingType.TRACK,
        lastRestockedAt: new Date(),
      }),
    );
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────────
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
      code: 'SAVE10',
      name: 'Save 10%',
      description: '10% off any order',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minPurchaseAmount: 0,
      usageLimit: 5000,
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
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
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
    const existing = await couponRepository.findOne({ where: { code: couponData.code } });
    if (!existing) {
      await couponRepository.save(couponRepository.create({ id: uuidv4(), ...couponData }));
      console.log(`  ✓ Created coupon: ${couponData.code}`);
    }
  }

  console.log('✅ Database seeding completed!');
  console.log('');
  console.log('📧 Test accounts (password: Password123!):');
  console.log('   superadmin@shopsmart.dev');
  console.log('   admin@shopsmart.dev');
  console.log('   customer@shopsmart.dev');
  console.log('');
  console.log('🎟️  Coupon codes: WELCOME10, SAVE10, SUMMER20, FLAT15');
}
