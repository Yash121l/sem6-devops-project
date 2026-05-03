import { categories as demoCategories } from "@/data/categories";
import { products as demoProducts } from "@/data/products";
import { calculateDiscount } from "@/lib/utils";
import { getOrCreateSessionId } from "@/lib/session-id";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "/api/v1"
).replace(/\/$/, "");
const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600";
const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600";

const demoCategoryLookup = new Map(
  demoCategories.map((category) => [category.id, category]),
);
const demoProductLookup = new Map(
  demoProducts.map((product) => [product.slug, product]),
);

function buildPath(path, searchParams) {
  const query = new URLSearchParams();

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
}

function authHeaders(accessToken) {
  return accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};
}

function sessionHeaders() {
  return { "x-session-id": getOrCreateSessionId() };
}

async function apiRequest(
  path,
  { body, headers, searchParams, ...options } = {},
) {
  const response = await fetch(buildPath(path, searchParams), {
    ...options,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text || `Request failed with status ${response.status}` };
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed");
  }

  return payload?.data ?? payload;
}

function findCategoryFallback(category) {
  if (!category) {
    return undefined;
  }

  return (
    demoCategoryLookup.get(category.slug) ||
    demoCategories.find(
      (item) => item.name.toLowerCase() === category.name?.toLowerCase(),
    )
  );
}

function findProductFallback(product) {
  if (!product) {
    return undefined;
  }

  return (
    demoProductLookup.get(product.slug) ||
    demoProducts.find(
      (item) => item.name.toLowerCase() === product.name?.toLowerCase(),
    )
  );
}

function normalizeStringArray(value, fallbackValue = []) {
  return Array.isArray(value) ? value.filter(Boolean) : fallbackValue;
}

function normalizeColorArray(value, fallbackValue = []) {
  if (!Array.isArray(value)) {
    return fallbackValue;
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return { name: entry, hex: "#111827" };
      }

      if (entry && typeof entry === "object" && entry.name) {
        return {
          name: entry.name,
          hex: entry.hex || "#111827",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function resolveImages(product, fallbackProduct) {
  const variantImages =
    product?.variants
      ?.flatMap((variant) =>
        Array.isArray(variant.images) ? variant.images : [],
      )
      .filter(Boolean) || [];

  const directImages = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];

  return directImages.length > 0
    ? directImages
    : variantImages.length > 0
      ? variantImages
      : fallbackProduct?.images || [DEFAULT_PRODUCT_IMAGE];
}

function resolveStock(product, fallbackProduct) {
  const stockFromVariants = product?.variants?.reduce((total, variant) => {
    const quantity =
      variant?.inventory?.availableQuantity ??
      (typeof variant?.inventory?.quantity === "number"
        ? variant.inventory.quantity - (variant.inventory.reservedQuantity || 0)
        : undefined);

    return total + (typeof quantity === "number" ? quantity : 0);
  }, 0);

  if (typeof stockFromVariants === "number" && stockFromVariants > 0) {
    return stockFromVariants;
  }

  return fallbackProduct?.stock ?? 0;
}

function isNewArrival(createdAt, fallbackProduct) {
  if (typeof fallbackProduct?.isNew === "boolean") {
    return fallbackProduct.isNew;
  }

  if (!createdAt) {
    return false;
  }

  const createdTime = new Date(createdAt).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  return (
    Number.isFinite(createdTime) && Date.now() - createdTime < thirtyDaysInMs
  );
}

function mapApiCategory(category, catalogProducts = []) {
  const fallbackCategory = findCategoryFallback(category);
  const slug = category.slug || fallbackCategory?.id || category.id;
  const categorySubcategories = normalizeStringArray(
    category.metadata?.subcategories,
  );
  const productCount =
    catalogProducts.filter((product) => product.category === slug).length ||
    fallbackCategory?.productCount ||
    0;

  return {
    id: slug,
    name: category.name || fallbackCategory?.name || "General",
    description:
      category.description ||
      fallbackCategory?.description ||
      "Browse our catalog.",
    image:
      category.imageUrl || fallbackCategory?.image || DEFAULT_CATEGORY_IMAGE,
    productCount,
    subcategories:
      categorySubcategories.length > 0
        ? categorySubcategories
        : fallbackCategory?.subcategories || [],
  };
}

function mapApiVariants(product) {
  const list = Array.isArray(product?.variants) ? product.variants : [];
  return list.map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: Number(v.price ?? 0),
    images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
    attributes: v.attributes && typeof v.attributes === "object" ? v.attributes : {},
    isDefault: Boolean(v.isDefault),
  }));
}

function resolveDefaultVariantId(variants, fallbackProduct) {
  const def = variants.find((v) => v.isDefault);
  if (def) {
    return def.id;
  }
  if (variants.length > 0) {
    return variants[0].id;
  }
  return fallbackProduct?.defaultVariantId ?? null;
}

/**
 * Pick variant UUID for add-to-cart from optional size/color (matches variant.attributes when present).
 * @param {object} product - Mapped storefront product (includes variants, defaultVariantId)
 */
export function pickVariantIdForProduct(product, selectedSize, selectedColor) {
  const variants = product.variants || [];
  if (!variants.length) {
    return product.defaultVariantId ?? null;
  }
  const size = selectedSize ?? null;
  const color = selectedColor ?? null;
  if (!size && !color) {
    return product.defaultVariantId ?? resolveDefaultVariantId(variants, product);
  }
  const match = variants.find((v) => {
    const a = v.attributes || {};
    const sz = a.size ?? a.Size;
    const col = a.color ?? a.Color ?? a.colour;
    if (size && color) {
      return String(sz) === String(size) && String(col) === String(color);
    }
    if (size) {
      return String(sz) === String(size);
    }
    if (color) {
      return String(col) === String(color);
    }
    return false;
  });
  return (
    match?.id ??
    product.defaultVariantId ??
    resolveDefaultVariantId(variants, product)
  );
}

function mapApiProduct(product) {
  const fallbackProduct = findProductFallback(product);
  const attributes = product.attributes || {};
  const price = Number(product.basePrice ?? fallbackProduct?.price ?? 0);
  const originalPrice =
    product.compareAtPrice !== null && product.compareAtPrice !== undefined
      ? Number(product.compareAtPrice)
      : fallbackProduct?.originalPrice || null;
  const categorySlug =
    product.category?.slug || fallbackProduct?.category || "general";
  const variants = mapApiVariants(product);
  const defaultVariantId = resolveDefaultVariantId(variants, fallbackProduct);

  return {
    id: product.id,
    name: product.name || fallbackProduct?.name || "Untitled product",
    slug: product.slug || fallbackProduct?.slug || product.id,
    description:
      product.shortDescription ||
      product.description ||
      fallbackProduct?.description ||
      "",
    fullDescription:
      product.description ||
      fallbackProduct?.fullDescription ||
      fallbackProduct?.description ||
      "",
    price,
    originalPrice,
    discount:
      originalPrice && price
        ? calculateDiscount(originalPrice, price)
        : fallbackProduct?.discount || 0,
    category: categorySlug,
    categoryName:
      product.category?.name || fallbackProduct?.categoryName || "General",
    images: resolveImages(product, fallbackProduct),
    rating: Number(attributes.rating ?? fallbackProduct?.rating ?? 4.6),
    reviewCount: Number(
      attributes.reviewCount ?? fallbackProduct?.reviewCount ?? 0,
    ),
    stock: resolveStock(product, fallbackProduct),
    sizes: normalizeStringArray(attributes.sizes, fallbackProduct?.sizes || []),
    colors: normalizeColorArray(
      attributes.colors,
      fallbackProduct?.colors || [],
    ),
    tags: normalizeStringArray(attributes.tags, fallbackProduct?.tags || []),
    isBestseller:
      Boolean(attributes.isBestseller) ||
      Boolean(product.isFeatured) ||
      Boolean(fallbackProduct?.isBestseller),
    isNew: isNewArrival(product.createdAt, fallbackProduct),
    soldThisWeek: Number(
      attributes.soldThisWeek ?? fallbackProduct?.soldThisWeek ?? 0,
    ),
    variants,
    defaultVariantId,
  };
}

function getFallbackProducts({ categoryId, search, limit } = {}) {
  let products = [...demoProducts];

  if (categoryId) {
    products = products.filter((product) => product.category === categoryId);
  }

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();
    products = products.filter((product) =>
      [product.name, product.description, product.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }

  return typeof limit === "number" ? products.slice(0, limit) : products;
}

export function getFallbackCategories() {
  return demoCategories;
}

export function getFallbackProductsList(options = {}) {
  return getFallbackProducts(options);
}

export function getFallbackProductBySlug(slug) {
  return demoProducts.find((product) => product.slug === slug);
}

export async function fetchCategories() {
  const [categories, products] = await Promise.all([
    apiRequest("/categories", { method: "GET" }),
    apiRequest("/products", { method: "GET" }).catch(() => []),
  ]);

  const mappedProducts = Array.isArray(products)
    ? products.map(mapApiProduct)
    : [];
  return categories.map((category) => mapApiCategory(category, mappedProducts));
}

export async function fetchProducts(options = {}) {
  const products = await apiRequest("/products", {
    method: "GET",
    searchParams: options,
  });

  const filteredProducts = Array.isArray(products)
    ? products.map(mapApiProduct)
    : [];

  if (options.categoryId) {
    return filteredProducts.filter(
      (product) => product.category === options.categoryId,
    );
  }

  if (options.search) {
    const normalizedSearch = options.search.toLowerCase();
    return filteredProducts.filter((product) =>
      [product.name, product.description, product.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }

  if (typeof options.limit === "number") {
    return filteredProducts.slice(0, options.limit);
  }

  return filteredProducts;
}

export async function fetchProductBySlug(slug) {
  const product = await apiRequest(`/products/slug/${slug}`, { method: "GET" });
  return mapApiProduct(product);
}

function mapApiUser(user, emailHint) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const email = user.email || emailHint;

  return {
    id: user.id,
    name: fullName || email?.split("@")[0] || "ShopSmart user",
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || user.id}`,
  };
}

function splitName(name) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName || "ShopSmart",
    lastName: rest.join(" ") || "User",
  };
}

async function fetchAuthenticatedProfile(accessToken, emailHint) {
  const user = await apiRequest("/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return mapApiUser(user, emailHint);
}

export async function loginWithApi(email, password) {
  const authPayload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  const user = await fetchAuthenticatedProfile(authPayload.accessToken, email);

  return {
    user,
    accessToken: authPayload.accessToken,
    refreshToken: authPayload.refreshToken,
    expiresIn: authPayload.expiresIn,
  };
}

/**
 * Map a server cart line to UI cart row shape.
 * @param {object} line
 */
export function mapServerCartLine(line) {
  const img =
    (Array.isArray(line.product?.images) && line.product.images[0]) ||
    DEFAULT_PRODUCT_IMAGE;
  return {
    id: line.productId,
    cartItemId: line.id,
    slug: line.product?.slug,
    name: line.product?.name ?? "Item",
    price: Number(line.unitPrice),
    image: img,
    quantity: line.quantity,
    variantId: line.variantId,
    size: line.metadata?.size,
    color: line.metadata?.color,
    variantName: line.variant?.name,
  };
}

export async function fetchServerCart(accessToken) {
  return apiRequest("/cart", {
    method: "GET",
    headers: { ...authHeaders(accessToken), ...sessionHeaders() },
  });
}

export async function addServerCartItem(
  accessToken,
  { productId, variantId, quantity = 1, metadata },
) {
  return apiRequest("/cart/items", {
    method: "POST",
    body: { productId, variantId, quantity, metadata },
    headers: { ...authHeaders(accessToken), ...sessionHeaders() },
  });
}

export async function updateServerCartItem(accessToken, itemId, quantity) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: "PUT",
    body: { quantity },
    headers: { ...authHeaders(accessToken), ...sessionHeaders() },
  });
}

export async function removeServerCartItem(accessToken, itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: "DELETE",
    headers: { ...authHeaders(accessToken), ...sessionHeaders() },
  });
}

export async function clearServerCart(accessToken) {
  await apiRequest("/cart", {
    method: "DELETE",
    headers: { ...authHeaders(accessToken), ...sessionHeaders() },
  });
}

export async function guestCheckoutApi(accessToken, dto, idempotencyKey) {
  const headers = {
    ...sessionHeaders(),
    ...authHeaders(accessToken),
  };
  if (idempotencyKey) {
    headers["idempotency-key"] = idempotencyKey;
  }
  return apiRequest("/orders/guest-checkout", {
    method: "POST",
    body: dto,
    headers,
  });
}

export async function fetchGuestOrderConfirmation(orderNumber, token) {
  return apiRequest("/orders/guest-confirmation", {
    method: "GET",
    searchParams: { orderNumber, token },
  });
}

export async function registerWithApi(name, email, password) {
  const { firstName, lastName } = splitName(name);
  const authPayload = await apiRequest("/auth/register", {
    method: "POST",
    body: { firstName, lastName, email, password },
  });

  const user = await fetchAuthenticatedProfile(authPayload.accessToken, email);

  return {
    user,
    accessToken: authPayload.accessToken,
    refreshToken: authPayload.refreshToken,
    expiresIn: authPayload.expiresIn,
  };
}

export function getFallbackCatalog(options = {}) {
  return {
    categories: getFallbackCategories(),
    products: getFallbackProducts(options),
  };
}
