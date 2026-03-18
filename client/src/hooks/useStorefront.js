import { startTransition, useEffect, useMemo, useState } from "react";
import {
  fetchCategories,
  fetchProductBySlug,
  fetchProducts,
  getFallbackCategories,
  getFallbackProductBySlug,
  getFallbackProductsList,
} from "@/lib/storefront";

function createAsyncState(data, overrides = {}) {
  return {
    data,
    status: "idle",
    source: "fallback",
    error: null,
    ...overrides,
  };
}

export function useStorefrontCategories() {
  const [state, setState] = useState(() =>
    createAsyncState(getFallbackCategories()),
  );

  useEffect(() => {
    let isMounted = true;

    setState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    fetchCategories()
      .then((categories) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState(
            createAsyncState(categories, { status: "success", source: "api" }),
          );
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState(
            createAsyncState(getFallbackCategories(), {
              status: "fallback",
              source: "fallback",
              error: error.message,
            }),
          );
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

export function useStorefrontProducts(options = {}) {
  const categoryId = options.categoryId;
  const limit = options.limit;
  const search = options.search;
  const requestOptions = useMemo(
    () => ({ categoryId, limit, search }),
    [categoryId, limit, search],
  );
  const fallbackProducts = getFallbackProductsList(requestOptions);
  const [state, setState] = useState(() => createAsyncState(fallbackProducts));

  useEffect(() => {
    let isMounted = true;

    setState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    fetchProducts(requestOptions)
      .then((products) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState(
            createAsyncState(products, { status: "success", source: "api" }),
          );
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState(
            createAsyncState(getFallbackProductsList(requestOptions), {
              status: "fallback",
              source: "fallback",
              error: error.message,
            }),
          );
        });
      });

    return () => {
      isMounted = false;
    };
  }, [requestOptions]);

  return state;
}

export function useStorefrontProduct(productSlug) {
  const fallbackProduct = getFallbackProductBySlug(productSlug);
  const [state, setState] = useState(() => createAsyncState(fallbackProduct));

  useEffect(() => {
    if (!productSlug) {
      setState(createAsyncState(null, { status: "fallback" }));
      return undefined;
    }

    let isMounted = true;

    setState((currentState) => ({
      ...currentState,
      status: "loading",
      error: null,
    }));

    fetchProductBySlug(productSlug)
      .then((product) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState(
            createAsyncState(product, { status: "success", source: "api" }),
          );
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState(
            createAsyncState(getFallbackProductBySlug(productSlug), {
              status: "fallback",
              source: "fallback",
              error: error.message,
            }),
          );
        });
      });

    return () => {
      isMounted = false;
    };
  }, [productSlug]);

  return state;
}
