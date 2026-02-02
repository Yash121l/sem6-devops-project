# Client Tests

This directory contains tests for the ShopSmart frontend application.

## Test Structure

```
client/src/
├── App.test.jsx           # Main app component tests
├── setupTests.js          # Test setup (imports jest-dom)
├── components/
│   └── *.test.jsx         # Component tests (co-located)
└── pages/
    └── *.test.jsx         # Page tests (co-located)
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (Interactive)

```bash
npm test -- --watch
```

### With UI

```bash
npx vitest --ui
```

### Single File

```bash
npm test -- ProductCard.test.jsx
```

### Coverage

```bash
npm test -- --coverage
```

## Writing Tests

### Component Test Example

```jsx
// src/components/ProductCard.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProductCard from "./ProductCard";

describe("ProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    price: 99.99,
    image: "/test.jpg",
  };

  it("renders product name", () => {
    render(<ProductCard {...mockProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("displays formatted price", () => {
    render(<ProductCard {...mockProduct} />);
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("renders product image", () => {
    render(<ProductCard {...mockProduct} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/test.jpg");
  });
});
```

### Page Test Example

```jsx
// src/pages/HomePage.test.jsx
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import HomePage from "./HomePage";
import { CartProvider } from "../context/CartContext";

// Wrapper for providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <CartProvider>{children}</CartProvider>
  </BrowserRouter>
);

describe("HomePage", () => {
  it("renders hero section", () => {
    render(<HomePage />, { wrapper: TestWrapper });
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
```

### Testing with Context

```jsx
// Mock context for isolated testing
import { vi } from "vitest";
import * as CartContext from "../context/CartContext";

vi.spyOn(CartContext, "useCart").mockReturnValue({
  items: [],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  total: 0,
});
```

## Test Utilities

### Custom Render with Providers

Create `src/test-utils.jsx`:

```jsx
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

const AllProviders = ({ children }) => (
  <BrowserRouter>
    <CartProvider>{children}</CartProvider>
  </BrowserRouter>
);

export const renderWithProviders = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
```

## Best Practices

- Test behavior, not implementation
- Use `screen` queries over container queries
- Prefer `getByRole` for accessible queries
- Mock API calls, not components
- Keep tests focused and readable
