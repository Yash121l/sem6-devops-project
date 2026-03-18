/**
 * @fileoverview Review mock data for products
 */

/**
 * @typedef {Object} Review
 * @property {number} id - Review ID
 * @property {number} productId - Associated product ID
 * @property {string} userName - Reviewer name
 * @property {string} userAvatar - Reviewer avatar URL
 * @property {number} rating - Rating (1-5)
 * @property {string} title - Review title
 * @property {string} content - Review content
 * @property {string} date - Review date
 * @property {boolean} verified - Whether purchase is verified
 * @property {number} helpful - Number of helpful votes
 * @property {string[]} images - Review images
 */

/** @type {Review[]} */
export const reviews = [
  {
    id: 1,
    productId: 1,
    userName: "Alex Thompson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 5,
    title: "Best headphones I've ever owned!",
    content:
      "The noise cancellation is incredible. I use these for work calls and music, and the sound quality is phenomenal. Battery life exceeds expectations. Worth every penny!",
    date: "2026-01-15",
    verified: true,
    helpful: 47,
    images: [],
  },
  {
    id: 2,
    productId: 1,
    userName: "Sarah Chen",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4,
    title: "Great sound, slightly tight fit",
    content:
      "Audio quality is amazing and the ANC works really well. Only giving 4 stars because they're a bit tight on my head after a few hours. Breaking them in slowly.",
    date: "2026-01-10",
    verified: true,
    helpful: 23,
    images: [],
  },
  {
    id: 3,
    productId: 2,
    userName: "Michael Ross",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    title: "Beautiful craftsmanship",
    content:
      "The leather quality is outstanding. I've been using this for 3 months now and it's developing a gorgeous patina. Plenty of room for my 15\" laptop and all my essentials.",
    date: "2026-01-08",
    verified: true,
    helpful: 31,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200"],
  },
  {
    id: 4,
    productId: 4,
    userName: "Emma Wilson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 5,
    title: "Game changer for my fitness routine",
    content:
      "The sleep tracking and workout detection are incredibly accurate. Love how it automatically detects when I start running. The battery really does last 2 weeks!",
    date: "2026-01-20",
    verified: true,
    helpful: 89,
    images: [],
  },
  {
    id: 5,
    productId: 6,
    userName: "James Miller",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    rating: 4,
    title: "Comfortable and fast",
    content:
      "These shoes are incredibly lightweight and the cushioning is perfect for my daily 5k runs. Took off one star because the color options are limited.",
    date: "2026-01-18",
    verified: true,
    helpful: 15,
    images: [],
  },
];

/**
 * Get reviews for a specific product
 * @param {number} productId - Product ID
 * @returns {Review[]} Array of reviews
 */
export const getReviewsByProductId = (productId) =>
  reviews.filter((r) => r.productId === productId);

/**
 * Get average rating for a product
 * @param {number} productId - Product ID
 * @returns {number} Average rating
 */
export const getAverageRating = (productId) => {
  const productReviews = getReviewsByProductId(productId);
  if (productReviews.length === 0) return 0;
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / productReviews.length;
};
