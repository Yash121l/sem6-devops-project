import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchProducts, getFallbackCatalog } from "@/lib/storefront";

describe("storefront helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps API products into the frontend storefront shape", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "prod_1",
            name: "Premium Wireless Headphones",
            slug: "premium-wireless-headphones",
            shortDescription: "Noise cancelling flagship headphones.",
            description: "Full description",
            basePrice: "249.99",
            compareAtPrice: "349.99",
            images: ["https://example.com/headphones.jpg"],
            isFeatured: true,
            createdAt: new Date().toISOString(),
            attributes: {
              rating: 4.9,
              reviewCount: 120,
              soldThisWeek: 88,
              tags: ["audio", "premium"],
            },
            category: {
              slug: "electronics",
              name: "Electronics",
            },
            variants: [],
          },
        ],
      }),
    });

    const products = await fetchProducts();

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: "prod_1",
      slug: "premium-wireless-headphones",
      category: "electronics",
      categoryName: "Electronics",
      price: 249.99,
      originalPrice: 349.99,
      discount: 29,
      isBestseller: true,
      stock: 3,
    });
  });

  it("exposes a complete fallback catalog when the API is unavailable", () => {
    const catalog = getFallbackCatalog({ categoryId: "electronics", limit: 2 });

    expect(catalog.categories.length).toBeGreaterThan(0);
    expect(catalog.products).toHaveLength(2);
    expect(
      catalog.products.every((product) => product.category === "electronics"),
    ).toBe(true);
  });
});
