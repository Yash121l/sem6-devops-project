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
];
