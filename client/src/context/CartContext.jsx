/**
 * @fileoverview Cart Context Provider
 * Manages shopping cart state with localStorage persistence
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { loadStoredJson, saveStoredJson } from "@/lib/storage";

/**
 * @typedef {Object} CartItem
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} image - Product image URL
 * @property {number} quantity - Quantity in cart
 * @property {string} [size] - Selected size
 * @property {string} [color] - Selected color
 */

/**
 * @typedef {Object} CartState
 * @property {CartItem[]} items - Cart items array
 * @property {boolean} isOpen - Whether cart drawer is open
 */

const CART_STORAGE_KEY = "shopsmart_cart";
const FREE_SHIPPING_THRESHOLD = 75;

/**
 * Initial cart state
 * @type {CartState}
 */
const initialState = {
  items: [],
  isOpen: false,
};

/**
 * Cart action types
 */
const CartActionTypes = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  TOGGLE_CART: "TOGGLE_CART",
  LOAD_CART: "LOAD_CART",
};

/**
 * Cart reducer function
 * @param {CartState} state - Current state
 * @param {Object} action - Action object
 * @returns {CartState} New state
 */
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

/**
 * Cart Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadStoredJson(CART_STORAGE_KEY, []);
    if (savedCart.length > 0) {
      dispatch({ type: CartActionTypes.LOAD_CART, payload: savedCart });
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    saveStoredJson(CART_STORAGE_KEY, state.items);
  }, [state.items]);

  /**
   * Add item to cart
   * @param {CartItem} item - Item to add
   */
  const addItem = (item) => {
    dispatch({ type: CartActionTypes.ADD_ITEM, payload: item });
  };

  /**
   * Remove item from cart
   * @param {number} id - Product ID
   * @param {string} [size] - Size variant
   * @param {string} [color] - Color variant
   */
  const removeItem = (id, size, color) => {
    dispatch({
      type: CartActionTypes.REMOVE_ITEM,
      payload: { id, size, color },
    });
  };

  /**
   * Update item quantity
   * @param {number} id - Product ID
   * @param {number} quantity - New quantity
   * @param {string} [size] - Size variant
   * @param {string} [color] - Color variant
   */
  const updateQuantity = (id, quantity, size, color) => {
    dispatch({
      type: CartActionTypes.UPDATE_QUANTITY,
      payload: { id, quantity, size, color },
    });
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    dispatch({ type: CartActionTypes.CLEAR_CART });
  };

  /**
   * Toggle cart drawer open/closed
   * @param {boolean} [isOpen] - Force specific state
   */
  const toggleCart = (isOpen) => {
    dispatch({ type: CartActionTypes.TOGGLE_CART, payload: isOpen });
  };

  // Computed values
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
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
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart context
 * @returns {Object} Cart context value
 * @throws {Error} If used outside CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
