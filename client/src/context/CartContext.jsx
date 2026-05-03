/**
 * @fileoverview Cart Context Provider
 * Server-backed cart when API is reachable (x-session-id + optional JWT); local fallback for offline/demo.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useRef,
} from "react";
import { loadStoredJson, saveStoredJson } from "@/lib/storage";
import { useUser } from "@/context/UserContext";
import {
  fetchServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
  mapServerCartLine,
} from "@/lib/storefront";

const CART_STORAGE_KEY = "shopsmart_cart";
const FREE_SHIPPING_THRESHOLD = 75;

const initialState = {
  items: [],
  isOpen: false,
};

const CartActionTypes = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  TOGGLE_CART: "TOGGLE_CART",
  LOAD_CART: "LOAD_CART",
};

function cartReducer(state, action) {
  switch (action.type) {
    case CartActionTypes.ADD_ITEM: {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.size === action.payload.size &&
          item.color === action.payload.color,
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.payload.quantity || 1;
        return { ...state, items: newItems };
      }

      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ],
      };
    }

    case CartActionTypes.REMOVE_ITEM: {
      if (action.payload.cartItemId) {
        return {
          ...state,
          items: state.items.filter((i) => i.cartItemId !== action.payload.cartItemId),
        };
      }
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.id === action.payload.id &&
              item.size === action.payload.size &&
              item.color === action.payload.color
            ),
        ),
      };
    }

    case CartActionTypes.UPDATE_QUANTITY: {
      if (action.payload.cartItemId) {
        return {
          ...state,
          items: state.items
            .map((item) =>
              item.cartItemId === action.payload.cartItemId
                ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        };
      }
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.id &&
            item.size === action.payload.size &&
            item.color === action.payload.color
              ? { ...item, quantity: Math.max(0, action.payload.quantity) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    }

    case CartActionTypes.CLEAR_CART: {
      return { ...state, items: [] };
    }

    case CartActionTypes.TOGGLE_CART: {
      return { ...state, isOpen: action.payload ?? !state.isOpen };
    }

    case CartActionTypes.LOAD_CART: {
      return { ...state, items: action.payload };
    }

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { session } = useUser();
  const accessToken = session?.accessToken ?? null;
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [serverMode, setServerMode] = useState(false);
  const [serverTotals, setServerTotals] = useState(null);
  const [cartError, setCartError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const applyServerCart = useCallback((cart) => {
    const lines = (cart.items || []).map(mapServerCartLine);
    dispatch({ type: CartActionTypes.LOAD_CART, payload: lines });
    setServerTotals({
      subtotal: Number(cart.subtotal ?? 0),
      taxAmount: Number(cart.taxAmount ?? 0),
      shippingAmount: Number(cart.shippingAmount ?? 0),
      discountAmount: Number(cart.discountAmount ?? 0),
      total: Number(cart.total ?? 0),
    });
    setServerMode(true);
    setCartError(null);
  }, []);

  const refreshServerCart = useCallback(async () => {
    try {
      const cart = await fetchServerCart(accessToken);
      if (!mounted.current) {
        return;
      }
      applyServerCart(cart);
    } catch (e) {
      if (!mounted.current) {
        return;
      }
      setServerMode(false);
      setServerTotals(null);
      setCartError(e instanceof Error ? e.message : "Cart unavailable");
    }
  }, [accessToken, applyServerCart]);

  useEffect(() => {
    refreshServerCart();
  }, [refreshServerCart]);

  // Hydrate local cart from storage when leaving server-backed mode (or on first local load).
  // Do not depend on `state.items.length`: when the user clears the cart we must not re-read
  // storage in the same pass and accidentally restore lines before persistence runs.
  useEffect(() => {
    if (!serverMode && state.items.length === 0) {
      const saved = loadStoredJson(CART_STORAGE_KEY, []);
      if (saved.length > 0) {
        dispatch({ type: CartActionTypes.LOAD_CART, payload: saved });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above
  }, [serverMode]);

  useEffect(() => {
    if (!serverMode) {
      saveStoredJson(CART_STORAGE_KEY, state.items);
    }
  }, [state.items, serverMode]);

  const addItem = useCallback(
    async (payload) => {
      const variantId = payload.variantId ?? payload.defaultVariantId;
      if (serverMode && variantId && payload.productId) {
        try {
          await addServerCartItem(accessToken, {
            productId: payload.productId,
            variantId,
            quantity: payload.quantity || 1,
            metadata: {
              size: payload.size,
              color: payload.color,
              slug: payload.slug,
            },
          });
          await refreshServerCart();
        } catch (e) {
          setCartError(e instanceof Error ? e.message : "Could not add to cart");
          throw e;
        }
        return;
      }
      if (serverMode && !variantId) {
        setCartError("This product cannot be added (no catalog variant).");
        return;
      }
      dispatch({ type: CartActionTypes.ADD_ITEM, payload: payload });
    },
    [accessToken, refreshServerCart, serverMode],
  );

  const removeItem = useCallback(
    async (id, size, color, cartItemId) => {
      if (serverMode && cartItemId) {
        try {
          await removeServerCartItem(accessToken, cartItemId);
          await refreshServerCart();
        } catch (e) {
          setCartError(e instanceof Error ? e.message : "Could not remove item");
        }
        return;
      }
      dispatch({
        type: CartActionTypes.REMOVE_ITEM,
        payload: { id, size, color, cartItemId },
      });
    },
    [accessToken, refreshServerCart, serverMode],
  );

  const updateQuantity = useCallback(
    async (id, quantity, size, color, cartItemId) => {
      if (serverMode && cartItemId) {
        try {
          if (quantity <= 0) {
            await removeServerCartItem(accessToken, cartItemId);
          } else {
            await updateServerCartItem(accessToken, cartItemId, quantity);
          }
          await refreshServerCart();
        } catch (e) {
          setCartError(e instanceof Error ? e.message : "Could not update cart");
        }
        return;
      }
      dispatch({
        type: CartActionTypes.UPDATE_QUANTITY,
        payload: { id, quantity, size, color, cartItemId },
      });
    },
    [accessToken, refreshServerCart, serverMode],
  );

  const clearCart = useCallback(async () => {
    if (serverMode) {
      try {
        await clearServerCart(accessToken);
        await refreshServerCart();
      } catch {
        dispatch({ type: CartActionTypes.CLEAR_CART });
      }
      return;
    }
    dispatch({ type: CartActionTypes.CLEAR_CART });
  }, [accessToken, refreshServerCart, serverMode]);

  const toggleCart = useCallback((isOpen) => {
    dispatch({ type: CartActionTypes.TOGGLE_CART, payload: isOpen });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalLocal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const subtotal = serverTotals ? serverTotals.subtotal : subtotalLocal;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  const value = {
    items: state.items,
    isOpen: state.isOpen,
    itemCount,
    subtotal,
    amountToFreeShipping,
    hasFreeShipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    serverMode,
    serverTotals,
    cartError,
    refreshCart: refreshServerCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
