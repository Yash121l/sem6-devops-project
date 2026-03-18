export const mockCategories = [
  {
    id: "category-1",
    name: "Electronics",
    slug: "electronics",
    description: "Tech essentials for work and play.",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600",
    metadata: {
      subcategories: ["Audio", "Wearables", "Accessories"],
    },
  },
  {
    id: "category-2",
    name: "Clothing",
    slug: "clothing",
    description: "Modern wardrobe staples.",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
    metadata: {
      subcategories: ["T-Shirts", "Outerwear"],
    },
  },
];

export const mockProducts = [
  {
    id: "product-1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    shortDescription: "Noise-cancelling flagship headphones.",
    description:
      "Long-form product description for premium wireless headphones.",
    basePrice: "249.99",
    compareAtPrice: "349.99",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    ],
    isFeatured: true,
    createdAt: new Date().toISOString(),
    attributes: {
      rating: 4.8,
      reviewCount: 125,
      soldThisWeek: 210,
      tags: ["audio", "wireless"],
      colors: [{ name: "Midnight Black", hex: "#1a1a1a" }],
    },
    category: {
      id: "category-1",
      slug: "electronics",
      name: "Electronics",
    },
    variants: [
      {
        id: "variant-1",
        sku: "HEADPHONE-001",
        images: [],
        inventory: {
          quantity: 3,
          reservedQuantity: 0,
          availableQuantity: 3,
        },
      },
    ],
  },
  {
    id: "product-2",
    name: "Performance Running Shoes",
    slug: "performance-running-shoes",
    shortDescription: "Lightweight daily trainers.",
    description: "Breathable running shoes built for comfort and pace.",
    basePrice: "159.99",
    compareAtPrice: "199.99",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
    isFeatured: false,
    createdAt: new Date().toISOString(),
    attributes: {
      rating: 4.5,
      reviewCount: 81,
      soldThisWeek: 98,
      sizes: ["8", "9", "10"],
      tags: ["running", "footwear"],
    },
    category: {
      id: "category-2",
      slug: "clothing",
      name: "Clothing",
    },
    variants: [
      {
        id: "variant-2",
        sku: "SHOE-001",
        images: [],
        inventory: {
          quantity: 12,
          reservedQuantity: 0,
          availableQuantity: 12,
        },
      },
    ],
  },
];

export const mockUser = {
  id: "user-1",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
};

export function findMockProductBySlug(slug) {
  return mockProducts.find((product) => product.slug === slug);
}
