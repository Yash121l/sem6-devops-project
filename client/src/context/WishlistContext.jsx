/**
 * @fileoverview Wishlist Context Provider
 * Manages wishlist state with localStorage persistence
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";

const WISHLIST_STORAGE_KEY = "shopsmart_wishlist";

/**
 * @typedef {Object} WishlistItem
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {number} price - Product price
 * @property {string} image - Product image URL
 */

/**
 * @typedef {Object} WishlistState
 * @property {WishlistItem[]} items - Wishlist items array
 */

const initialState = {
  items: [],
};

const WishlistActionTypes = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  LOAD_WISHLIST: "LOAD_WISHLIST",
  CLEAR_WISHLIST: "CLEAR_WISHLIST",
};

/**
 * Wishlist reducer
 * @param {WishlistState} state - Current state
 * @param {Object} action - Action object
 * @returns {WishlistState} New state
 */
function wishlistReducer(state, action) {
  switch (action.type) {
    case WishlistActionTypes.ADD_ITEM: {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (exists) return state;
      return { ...state, items: [...state.items, action.payload] };
    }

    case WishlistActionTypes.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }

    case WishlistActionTypes.LOAD_WISHLIST: {
      return { ...state, items: action.payload };
    }

    case WishlistActionTypes.CLEAR_WISHLIST: {
      return { ...state, items: [] };
    }

    default:
      return state;
  }
}

const WishlistContext = createContext(null);

/**
 * Wishlist Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        dispatch({ type: WishlistActionTypes.LOAD_WISHLIST, payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }, [state.items]);

  /**
   * Add item to wishlist
   * @param {WishlistItem} item - Item to add
   */
  const addItem = (item) => {
    dispatch({ type: WishlistActionTypes.ADD_ITEM, payload: item });
  };

  /**
   * Remove item from wishlist
   * @param {number} id - Product ID
   */
  const removeItem = (id) => {
    dispatch({ type: WishlistActionTypes.REMOVE_ITEM, payload: id });
  };

  /**
   * Check if item is in wishlist
   * @param {number} id - Product ID
   * @returns {boolean} Whether item is in wishlist
   */
  const isInWishlist = (id) => {
    return state.items.some((item) => item.id === id);
  };

  /**
   * Toggle item in wishlist
   * @param {WishlistItem} item - Item to toggle
   */
  const toggleWishlist = (item) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  /**
   * Clear wishlist
   */
  const clearWishlist = () => {
    dispatch({ type: WishlistActionTypes.CLEAR_WISHLIST });
  };

  const value = {
    items: state.items,
    itemCount: state.items.length,
    addItem,
    removeItem,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/**
 * Hook to access wishlist context
 * @returns {Object} Wishlist context value
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
