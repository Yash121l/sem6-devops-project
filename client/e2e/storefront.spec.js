import { expect, test } from "@playwright/test";

const mockCategories = [
  {
    id: "category-1",
    name: "Electronics",
    slug: "electronics",
    description: "Tech essentials.",
    imageUrl: "https://example.com/electronics.jpg",
    metadata: {
      subcategories: ["Audio", "Wearables"],
    },
  },
];

const mockProducts = [
  {
    id: "product-1",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    shortDescription: "Noise cancelling flagship headphones.",
    description: "Long-form product description.",
    basePrice: "249.99",
    compareAtPrice: "349.99",
    images: ["https://example.com/headphones.jpg"],
    isFeatured: true,
    createdAt: new Date().toISOString(),
    attributes: {
      rating: 4.8,
      reviewCount: 125,
      soldThisWeek: 210,
    },
    category: {
      slug: "electronics",
      name: "Electronics",
    },
    variants: [],
  },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith("/categories")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockCategories }),
      });
      return;
    }

    if (url.pathname.endsWith("/products")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockProducts }),
      });
      return;
    }

    if (url.pathname.endsWith("/products/slug/premium-wireless-headphones")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockProducts[0] }),
      });
      return;
    }

    if (url.pathname.endsWith("/auth/login")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: "test-access-token",
            refreshToken: "test-refresh-token",
            expiresIn: 900,
          },
        }),
      });
      return;
    }

    if (url.pathname.endsWith("/users/me")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "user-1",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
          },
        }),
      });
      return;
    }

    await route.abort();
  });
});

test("signs in through the API flow and adds an item to the cart", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email Address").fill("test@example.com");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Live catalog connected")).toBeVisible();

  await page
    .getByRole("link", { name: /premium wireless headphones/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/product\/premium-wireless-headphones$/);
  await page.getByRole("button", { name: "Add to Cart" }).click();

  await expect(page.getByText(/Your Cart \(1\)/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Proceed to Checkout" }),
  ).toBeVisible();
});
