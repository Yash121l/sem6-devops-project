/**
 * @fileoverview Product mock data for e-commerce store
 * Contains sample products with all necessary fields for display
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Unique product identifier
 * @property {string} name - Product name
 * @property {string} slug - URL-friendly product identifier
 * @property {string} description - Short product description
 * @property {string} fullDescription - Detailed product description
 * @property {number} price - Current price
 * @property {number|null} originalPrice - Original price (if on sale)
 * @property {number} discount - Discount percentage
 * @property {string} category - Product category slug
 * @property {string} categoryName - Human-readable category name
 * @property {string[]} images - Array of image URLs
 * @property {number} rating - Average rating (0-5)
 * @property {number} reviewCount - Number of reviews
 * @property {number} stock - Available stock quantity
 * @property {string[]} sizes - Available sizes
 * @property {Object[]} colors - Available colors
 * @property {string[]} tags - Product tags
 * @property {boolean} isBestseller - Whether product is a bestseller
 * @property {boolean} isNew - Whether product is new
 * @property {number} soldThisWeek - Number sold this week (social proof)
 */

/** @type {Product[]} */
export const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description:
      "Experience crystal-clear audio with our flagship noise-cancelling headphones.",
    fullDescription:
      "Immerse yourself in pure sound with our Premium Wireless Headphones. Featuring advanced active noise cancellation, 40mm custom drivers, and up to 30 hours of battery life. The premium memory foam ear cushions provide all-day comfort while the sleek aluminum construction ensures durability.",
    price: 249.99,
    originalPrice: 349.99,
    discount: 29,
    category: "electronics",
    categoryName: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
    ],
    rating: 4.8,
    reviewCount: 1247,
    stock: 3,
    sizes: [],
    colors: [
      { name: "Midnight Black", hex: "#1a1a1a" },
      { name: "Pearl White", hex: "#f5f5f5" },
      { name: "Rose Gold", hex: "#b76e79" },
    ],
    tags: ["wireless", "noise-cancelling", "premium"],
    isBestseller: true,
    isNew: false,
    soldThisWeek: 847,
  },
  {
    id: 2,
    name: "Classic Leather Messenger Bag",
    slug: "classic-leather-messenger-bag",
    description: "Handcrafted genuine leather bag perfect for professionals.",
    fullDescription:
      "Our Classic Leather Messenger Bag combines timeless style with modern functionality. Made from full-grain leather that develops a beautiful patina over time. Features include a padded laptop compartment, multiple organizer pockets, and an adjustable shoulder strap.",
    price: 189.0,
    originalPrice: null,
    discount: 0,
    category: "accessories",
    categoryName: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    ],
    rating: 4.6,
    reviewCount: 523,
    stock: 15,
    sizes: [],
    colors: [
      { name: "Cognac Brown", hex: "#8b4513" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    tags: ["leather", "professional", "handcrafted"],
    isBestseller: true,
    isNew: false,
    soldThisWeek: 312,
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-tshirt",
    description:
      "Soft, sustainable, and incredibly comfortable everyday essential.",
    fullDescription:
      "Made from 100% GOTS-certified organic cotton, this t-shirt is gentle on your skin and the environment. Pre-shrunk fabric with reinforced seams for long-lasting wear. The relaxed fit and breathable material make it perfect for any occasion.",
    price: 34.99,
    originalPrice: 44.99,
    discount: 22,
    category: "clothing",
    categoryName: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600",
    ],
    rating: 4.5,
    reviewCount: 892,
    stock: 50,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Navy", hex: "#1e3a5f" },
      { name: "Heather Gray", hex: "#9ca3af" },
      { name: "Black", hex: "#1a1a1a" },
    ],
    tags: ["organic", "sustainable", "cotton"],
    isBestseller: false,
    isNew: true,
    soldThisWeek: 423,
  },
  {
    id: 4,
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description: "Track your health and fitness with precision and style.",
    fullDescription:
      "Take control of your health with our Smart Fitness Watch. Features include 24/7 heart rate monitoring, GPS tracking, sleep analysis, and 100+ workout modes. Water-resistant up to 50m with a stunning AMOLED display. Battery lasts up to 14 days.",
    price: 299.0,
    originalPrice: 399.0,
    discount: 25,
    category: "electronics",
    categoryName: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600",
    ],
    rating: 4.7,
    reviewCount: 2156,
    stock: 8,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Space Gray", hex: "#4a4a4a" },
      { name: "Silver", hex: "#c0c0c0" },
      { name: "Rose Gold", hex: "#b76e79" },
    ],
    tags: ["fitness", "smartwatch", "health"],
    isBestseller: true,
    isNew: false,
    soldThisWeek: 1089,
  },
  {
    id: 5,
    name: "Minimalist Ceramic Vase Set",
    slug: "minimalist-ceramic-vase-set",
    description: "Elevate your space with these handcrafted artisan vases.",
    fullDescription:
      "This set of three handcrafted ceramic vases adds a touch of modern elegance to any room. Each piece is uniquely glazed by skilled artisans. The varying heights and shapes create visual interest while maintaining a cohesive minimalist aesthetic.",
    price: 79.99,
    originalPrice: null,
    discount: 0,
    category: "home",
    categoryName: "Home & Living",
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600",
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600",
    ],
    rating: 4.9,
    reviewCount: 178,
    stock: 12,
    sizes: [],
    colors: [
      { name: "Matte White", hex: "#f5f5f5" },
      { name: "Sage Green", hex: "#9caf88" },
      { name: "Terracotta", hex: "#e07a5f" },
    ],
    tags: ["handcrafted", "ceramic", "decor"],
    isBestseller: false,
    isNew: true,
    soldThisWeek: 67,
  },
  {
    id: 6,
    name: "Performance Running Shoes",
    slug: "performance-running-shoes",
    description: "Engineered for speed, comfort, and endurance.",
    fullDescription:
      "Designed with input from elite athletes, these running shoes feature responsive cushioning, a breathable mesh upper, and a durable rubber outsole. The lightweight construction reduces fatigue while the heel counter provides stability on every stride.",
    price: 159.99,
    originalPrice: 199.99,
    discount: 20,
    category: "clothing",
    categoryName: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600",
    ],
    rating: 4.4,
    reviewCount: 634,
    stock: 25,
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    colors: [
      { name: "Volt Yellow", hex: "#ccff00" },
      { name: "Core Black", hex: "#1a1a1a" },
      { name: "Cloud White", hex: "#ffffff" },
    ],
    tags: ["running", "athletic", "performance"],
    isBestseller: true,
    isNew: false,
    soldThisWeek: 521,
  },
  {
    id: 7,
    name: "Artisan Coffee Blend",
    slug: "artisan-coffee-blend",
    description: "Single-origin beans roasted to perfection.",
    fullDescription:
      "Our signature blend combines beans from the highlands of Colombia and Ethiopia, creating a smooth, balanced cup with notes of dark chocolate, caramel, and citrus. Small-batch roasted weekly for peak freshness. 12oz bag.",
    price: 24.99,
    originalPrice: null,
    discount: 0,
    category: "food",
    categoryName: "Food & Beverage",
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
    ],
    rating: 4.8,
    reviewCount: 1567,
    stock: 100,
    sizes: [],
    colors: [],
    tags: ["coffee", "artisan", "organic"],
    isBestseller: true,
    isNew: false,
    soldThisWeek: 892,
  },
  {
    id: 8,
    name: "Luxury Scented Candle Set",
    slug: "luxury-scented-candle-set",
    description: "Transform your home with these hand-poured soy candles.",
    fullDescription:
      "This collection of three luxury candles features calming scents: Lavender & Eucalyptus, Vanilla & Sandalwood, and Fresh Linen. Made with 100% soy wax and cotton wicks for a clean, long-lasting burn of 45+ hours each.",
    price: 54.99,
    originalPrice: 74.99,
    discount: 27,
    category: "home",
    categoryName: "Home & Living",
    images: [
      "https://images.unsplash.com/photo-1602607663458-63eb47d3c56b?w=600",
      "https://images.unsplash.com/photo-1603905179682-f5e1a0a73e42?w=600",
    ],
    rating: 4.6,
    reviewCount: 445,
    stock: 35,
    sizes: [],
    colors: [],
    tags: ["candles", "aromatherapy", "soy"],
    isBestseller: false,
    isNew: false,
    soldThisWeek: 234,
  },
  {
    id: 9,
    name: "Designer Sunglasses",
    slug: "designer-sunglasses",
    description: "Italian-crafted frames with polarized UV protection.",
    fullDescription:
      "These designer sunglasses feature hand-polished acetate frames crafted in Italy. The polarized lenses offer 100% UV protection while reducing glare for crystal-clear vision. Includes a premium leather case and cleaning cloth.",
    price: 195.0,
    originalPrice: 245.0,
    discount: 20,
    category: "accessories",
    categoryName: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
    ],
    rating: 4.5,
    reviewCount: 289,
    stock: 18,
    sizes: [],
    colors: [
      { name: "Tortoise", hex: "#8b4513" },
      { name: "Jet Black", hex: "#1a1a1a" },
      { name: "Crystal Clear", hex: "#e8e8e8" },
    ],
    tags: ["sunglasses", "designer", "italian"],
    isBestseller: false,
    isNew: true,
    soldThisWeek: 156,
  },
  {
    id: 10,
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description: "Fast wireless charging for all Qi-enabled devices.",
    fullDescription:
      "Charge your devices effortlessly with our sleek wireless charging pad. Supports up to 15W fast charging, compatible with all Qi-enabled devices. The non-slip surface and LED indicator make it perfect for your nightstand or desk.",
    price: 39.99,
    originalPrice: 49.99,
    discount: 20,
    category: "electronics",
    categoryName: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=600",
    ],
    rating: 4.3,
    reviewCount: 756,
    stock: 60,
    sizes: [],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "White", hex: "#ffffff" },
    ],
    tags: ["wireless", "charging", "tech"],
    isBestseller: false,
    isNew: false,
    soldThisWeek: 445,
  },
  {
    id: 11,
    name: "Denim Jacket Classic",
    slug: "denim-jacket-classic",
    description: "Timeless denim jacket with modern detailing.",
    fullDescription:
      "A wardrobe essential that never goes out of style. Made from premium cotton denim with just the right amount of stretch for comfort. Features antique brass buttons, multiple pockets, and a slightly cropped fit that works with any outfit.",
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    category: "clothing",
    categoryName: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
    ],
    rating: 4.7,
    reviewCount: 412,
    stock: 22,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Light Wash", hex: "#a4c2d7" },
      { name: "Dark Indigo", hex: "#1e3a5f" },
    ],
    tags: ["denim", "jacket", "classic"],
    isBestseller: true,
    isNew: false,
    soldThisWeek: 287,
  },
  {
    id: 12,
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description: "Non-slip, eco-friendly mat for your practice.",
    fullDescription:
      "Elevate your yoga practice with our premium mat. Made from natural rubber with a microfiber suede surface that grips better when wet. 6mm thickness provides excellent cushioning while maintaining stability. Includes carrying strap.",
    price: 68.0,
    originalPrice: null,
    discount: 0,
    category: "accessories",
    categoryName: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600",
    ],
    rating: 4.8,
    reviewCount: 567,
    stock: 40,
    sizes: [],
    colors: [
      { name: "Deep Purple", hex: "#4a0080" },
      { name: "Ocean Blue", hex: "#006994" },
      { name: "Forest Green", hex: "#228b22" },
      { name: "Dusty Rose", hex: "#dcae96" },
    ],
    tags: ["yoga", "fitness", "eco-friendly"],
    isBestseller: false,
    isNew: true,
    soldThisWeek: 198,
  },
];

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Product|undefined} Product object or undefined
 */
export const getProductById = (id) => products.find((p) => p.id === id);

/**
 * Get product by slug
 * @param {string} slug - Product slug
 * @returns {Product|undefined} Product object or undefined
 */
export const getProductBySlug = (slug) => products.find((p) => p.slug === slug);

/**
 * Get products by category
 * @param {string} category - Category slug
 * @returns {Product[]} Array of products in category
 */
export const getProductsByCategory = (category) =>
  products.filter((p) => p.category === category);

/**
 * Get bestseller products
 * @param {number} limit - Maximum number of products to return
 * @returns {Product[]} Array of bestseller products
 */
export const getBestsellers = (limit = 8) =>
  products.filter((p) => p.isBestseller).slice(0, limit);

/**
 * Get new arrival products
 * @param {number} limit - Maximum number of products to return
 * @returns {Product[]} Array of new products
 */
export const getNewArrivals = (limit = 8) =>
  products.filter((p) => p.isNew).slice(0, limit);

/**
 * Get products on sale
 * @param {number} limit - Maximum number of products to return
 * @returns {Product[]} Array of products on sale
 */
export const getSaleProducts = (limit = 8) =>
  products.filter((p) => p.discount > 0).slice(0, limit);
