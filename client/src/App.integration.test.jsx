import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import App from "./App";
import { server } from "@/mocks/server";

describe("App", () => {
  it("renders the fallback storefront and updates cart state from the home page", async () => {
    server.use(
      http.get("/api/v1/categories", () => HttpResponse.error()),
      http.get("/api/v1/products", () => HttpResponse.error()),
      // Without this, GET /cart succeeds (MSW default), server cart mode stays on, and
      // static fallback products (no defaultVariantId) cannot be POSTed — badge never updates.
      http.get("/api/v1/cart", () => HttpResponse.error()),
    );

    render(<App />);

    expect(await screen.findByText(/Demo catalog/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Fallback data while offline/i),
    ).toBeInTheDocument();

    const addToCartButtons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButtons[0]);

    await waitFor(() => {
      expect(screen.getByLabelText(/shopping cart/i)).toHaveTextContent("1");
    });
  });
});
