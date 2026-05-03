import { http, HttpResponse } from "msw";
import {
  findMockProductBySlug,
  mockCategories,
  mockProducts,
  mockUser,
} from "@/mocks/data";

function createJsonResponse(data, init) {
  return HttpResponse.json(
    {
      success: true,
      data,
    },
    init,
  );
}

const MOCK_CONFIRMATION_TOKEN = "a".repeat(64);

/** @type {Map<string, ReturnType<typeof emptyCart>>} */
const cartsBySession = new Map();

function emptyCart() {
  return {
    id: "cart-msw",
    items: [],
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    shippingAmount: 0,
    total: 0,
    couponId: null,
  };
}

function sessionKey(request) {
  return request.headers.get("x-session-id") || "default-session";
}

function getCart(request) {
  const key = sessionKey(request);
  if (!cartsBySession.has(key)) {
    cartsBySession.set(key, emptyCart());
  }
  return cartsBySession.get(key);
}

function recalcCart(cart) {
  const sub = cart.items.reduce(
    (s, i) => s + Number(i.unitPrice) * i.quantity,
    0,
  );
  cart.subtotal = Math.round(sub * 100) / 100;
  cart.discountAmount = 0;
  const tax = Math.round(sub * 0.08 * 100) / 100;
  cart.taxAmount = tax;
  cart.shippingAmount = sub >= 75 ? 0 : 9.99;
  cart.total =
    Math.round((sub + tax + cart.shippingAmount) * 100) / 100;
}

export const handlers = [
  http.get("/api/v1/categories", () => createJsonResponse(mockCategories)),
  http.get("/api/v1/products", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    if (!search) {
      return createJsonResponse(mockProducts);
    }

    const filteredProducts = mockProducts.filter((product) =>
      [product.name, product.description, product.category.name]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

    return createJsonResponse(filteredProducts);
  }),
  http.get("/api/v1/products/slug/:slug", ({ params }) => {
    const product = findMockProductBySlug(params.slug);

    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return createJsonResponse(product);
  }),
  http.post("/api/v1/auth/login", async () =>
    createJsonResponse({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      expiresIn: 900,
    }),
  ),
  http.post("/api/v1/auth/register", async () =>
    createJsonResponse({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      expiresIn: 900,
    }),
  ),
  http.get("/api/v1/users/me", () => createJsonResponse(mockUser)),
  http.get("/api/v1/cart", ({ request }) => {
    const cart = getCart(request);
    recalcCart(cart);
    return createJsonResponse(cart);
  }),
  http.post("/api/v1/cart/items", async ({ request }) => {
    const cart = getCart(request);
    const body = await request.json();
    const product = mockProducts.find((p) => p.id === body.productId);
    const unitPrice = Number(product?.basePrice ?? 0);
    const qty = body.quantity || 1;
    const existing = cart.items.find((i) => i.variantId === body.variantId);
    if (existing) {
      existing.quantity += qty;
      existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
      cart.items.push({
        id: `line-${body.variantId}-${cart.items.length}`,
        productId: body.productId,
        variantId: body.variantId,
        quantity: qty,
        unitPrice,
        totalPrice: unitPrice * qty,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              sku: product.slug,
            }
          : null,
        variant: {
          id: body.variantId,
          name: "Default",
          sku: "SKU",
        },
        metadata: body.metadata || {},
      });
    }
    recalcCart(cart);
    return createJsonResponse(cart);
  }),
  http.put("/api/v1/cart/items/:itemId", async ({ request, params }) => {
    const cart = getCart(request);
    const body = await request.json();
    const item = cart.items.find((i) => i.id === params.itemId);
    if (!item) {
      return HttpResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 },
      );
    }
    item.quantity = body.quantity;
    item.totalPrice = item.unitPrice * item.quantity;
    recalcCart(cart);
    return createJsonResponse(cart);
  }),
  http.delete("/api/v1/cart/items/:itemId", ({ request, params }) => {
    const cart = getCart(request);
    cart.items = cart.items.filter((i) => i.id !== params.itemId);
    recalcCart(cart);
    return createJsonResponse(cart);
  }),
  http.delete("/api/v1/cart", ({ request }) => {
    cartsBySession.set(sessionKey(request), emptyCart());
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("/api/v1/orders/guest-checkout", async ({ request }) => {
    const cart = getCart(request);
    if (!cart.items.length) {
      return HttpResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 },
      );
    }
    const total = cart.total;
    cartsBySession.set(sessionKey(request), emptyCart());
    return createJsonResponse({
      orderNumber: "ORD-MSW-TEST",
      confirmationToken: MOCK_CONFIRMATION_TOKEN,
      orderId: "00000000-0000-4000-8000-000000000001",
      total,
    });
  }),
  http.get("/api/v1/orders/guest-confirmation", ({ request }) => {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get("orderNumber");
    const token = url.searchParams.get("token");
    if (orderNumber === "ORD-MSW-TEST" && token === MOCK_CONFIRMATION_TOKEN) {
      return createJsonResponse({
        orderNumber,
        status: "confirmed",
        paymentStatus: "completed",
        subtotal: 249.99,
        discountAmount: 0,
        taxAmount: 20,
        shippingAmount: 0.49,
        total: 270.48,
        customerEmail: "test@example.com",
        placedAt: new Date().toISOString(),
        items: [
          {
            productName: "Premium Wireless Headphones",
            variantName: "Default",
            quantity: 1,
            unitPrice: 249.99,
            totalPrice: 249.99,
          },
        ],
      });
    }
    return HttpResponse.json(
      { success: false, message: "Order not found" },
      { status: 404 },
    );
  }),
];
