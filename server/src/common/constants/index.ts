export const API_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

export const CACHE_KEYS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    USER: 'user',
    CART: 'cart',
} as const;

export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
} as const;

export const PASSWORD_RULES = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
} as const;

export const ORDER_NUMBER_PREFIX = 'ORD';
export const TRANSACTION_ID_PREFIX = 'TXN';
