/**
 * @fileoverview Category data for e-commerce store
 * Contains category definitions with metadata
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Category identifier/slug
 * @property {string} name - Display name
 * @property {string} description - Category description
 * @property {string} image - Category image URL
 * @property {number} productCount - Number of products in category
 * @property {string[]} subcategories - List of subcategory names
 */

/** @type {Category[]} */
export const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest gadgets on cutting-edge technology",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600",
    productCount: 156,
    subcategories: [
      "Headphones",
      "Smartwatches",
      "Speakers",
      "Chargers",
      "Cameras",
    ],
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "Fashion-forward apparel for every occasion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
    productCount: 324,
    subcategories: [
      "T-Shirts",
      "Jackets",
      "Pants",
      "Dresses",
      "Shoes",
      "Activewear",
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Complete your look with premium accessories",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600",
    productCount: 198,
    subcategories: [
      "Bags",
      "Watches",
      "Sunglasses",
      "Jewelry",
      "Belts",
      "Scarves",
    ],
  },
  {
    id: "home",
    name: "Home & Living",
    description: "Transform your space into a sanctuary",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600",
    productCount: 267,
    subcategories: [
      "Decor",
      "Furniture",
      "Lighting",
      "Bedding",
      "Kitchen",
      "Storage",
    ],
  },
  {
    id: "food",
    name: "Food & Beverage",
    description: "Artisan food and drinks for connoisseurs",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
    productCount: 89,
    subcategories: ["Coffee", "Tea", "Snacks", "Gourmet", "Organic"],
  },
  {
    id: "beauty",
    name: "Beauty & Care",
    description: "Self-care essentials and beauty products",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
    productCount: 145,
    subcategories: ["Skincare", "Haircare", "Makeup", "Fragrance", "Tools"],
  },
];

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Category|undefined} Category object or undefined
 */
export const getCategoryById = (id) => categories.find((c) => c.id === id);

/**
 * Get all category IDs
 * @returns {string[]} Array of category IDs
 */
export const getCategoryIds = () => categories.map((c) => c.id);
