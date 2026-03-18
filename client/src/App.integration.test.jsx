import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("API unavailable"),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the fallback storefront and updates cart state from the home page", async () => {
    render(<App />);

    expect(
      await screen.findByText(/Using demo catalog fallback/i),
    ).toBeInTheDocument();

    const addToCartButtons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButtons[0]);

    expect(screen.getByLabelText(/shopping cart/i)).toHaveTextContent("1");
  });
});
