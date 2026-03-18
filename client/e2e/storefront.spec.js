import { expect, test } from "@playwright/test";
import { mockUser } from "../src/mocks/data.js";

const session = {
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  expiresIn: 900,
};

async function seedLocalStorage(page, values) {
  await page.addInitScript((entries) => {
    window.localStorage.clear();

    Object.entries(entries).forEach(([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    });
  }, values);
}

test.describe("Storefront E2E", () => {
  test("signs in and browses a live mocked catalog", async ({ page }) => {
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
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Premium Wireless Headphones",
      }),
    ).toBeVisible();
    await expect(page.getByText("Only 3 left in stock")).toBeVisible();
  });

  test("adds an item to cart and completes checkout", async ({ page }) => {
    await seedLocalStorage(page, {
      shopsmart_user: {
        id: mockUser.id,
        name: `${mockUser.firstName} ${mockUser.lastName}`,
        email: mockUser.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.email}`,
      },
      shopsmart_session: session,
    });

    await page.goto("/product/premium-wireless-headphones");

    await page.getByTestId("product-add-to-cart").click();
    await expect(page.getByText(/Your Cart \(1\)/)).toBeVisible();

    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.getByLabel("First Name *").fill("Test");
    await page.getByLabel("Last Name *").fill("User");
    await page.getByLabel("Email Address *").fill("test@example.com");
    await page.getByLabel("Street Address *").fill("221B Baker Street");
    await page.getByLabel("City *").fill("Mumbai");
    await page.getByLabel("State *").fill("MH");
    await page.getByLabel("ZIP Code *").fill("400001");
    await page.getByRole("button", { name: "Continue to Payment" }).click();

    await page.getByLabel("Card Number *").fill("4242 4242 4242 4242");
    await page.getByLabel("Name on Card *").fill("Test User");
    await page.getByLabel("Expiry Date *").fill("12/30");
    await page.getByLabel("CVV *").fill("123");
    await page.getByRole("button", { name: "Review Order" }).click();

    await expect(page.getByText("Review Your Order")).toBeVisible();
    await page.getByRole("button", { name: /Place Order/i }).click();

    await expect(page).toHaveURL(/\/order-confirmation\/SS-/);
    await expect(
      page.getByRole("heading", { name: "Order Confirmed!" }),
    ).toBeVisible();
  });

  test("adds a product to wishlist and moves it into the cart", async ({
    page,
  }) => {
    await page.goto("/product/premium-wireless-headphones");

    await page.getByTestId("product-toggle-wishlist").click();
    await page.getByRole("link", { name: "Wishlist" }).click();

    await expect(page).toHaveURL(/\/wishlist$/);
    await expect(page.getByText("My Wishlist (1 item)")).toBeVisible();

    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByText(/Your Cart \(1\)/)).toBeVisible();
  });
});
