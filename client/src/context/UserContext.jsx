/**
 * @fileoverview User Context Provider
 * Manages user authentication state with API-first auth and demo fallback
 */

import React, { createContext, useContext, useState } from "react";
import { loginWithApi, registerWithApi } from "@/lib/storefront";
import {
  loadStoredJson,
  removeStoredValue,
  saveStoredJson,
} from "@/lib/storage";

const USER_STORAGE_KEY = "shopsmart_user";
const SESSION_STORAGE_KEY = "shopsmart_session";

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} [avatar] - Avatar URL
 */

const UserContext = createContext(null);

/**
 * User Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function UserProvider({ children }) {
  // Hydrate synchronously so CartProvider's first fetch sees the session (E2E seeds storage before load).
  const [user, setUser] = useState(() => loadStoredJson(USER_STORAGE_KEY, null));
  const [session, setSession] = useState(() =>
    loadStoredJson(SESSION_STORAGE_KEY, null),
  );
  const [isLoading] = useState(false);
  const [authSource, setAuthSource] = useState("demo");

  const persistSession = (nextUser, nextSession, source) => {
    setUser(nextUser);
    setSession(nextSession);
    setAuthSource(source);
    saveStoredJson(USER_STORAGE_KEY, nextUser);
    saveStoredJson(SESSION_STORAGE_KEY, nextSession);
  };

  const createDemoUser = (name, email) => ({
    id: `demo_${Date.now()}`,
    name: name || email.split("@")[0],
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
  });

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    try {
      const result = await loginWithApi(email, password);
      persistSession(
        result.user,
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        "api",
      );
      return { success: true, source: "api" };
    } catch (error) {
      const demoUser = createDemoUser("", email);
      persistSession(demoUser, null, "demo");
      return { success: true, source: "demo", warning: error.message };
    }
  };

  /**
   * Register function
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    try {
      const result = await registerWithApi(name, email, password);
      persistSession(
        result.user,
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        "api",
      );
      return { success: true, source: "api" };
    } catch (error) {
      const demoUser = createDemoUser(name, email);
      persistSession(demoUser, null, "demo");
      return { success: true, source: "demo", warning: error.message };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    setSession(null);
    setAuthSource("demo");
    removeStoredValue(USER_STORAGE_KEY);
    removeStoredValue(SESSION_STORAGE_KEY);
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    authSource,
    login,
    register,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Hook to access user context
 * @returns {Object} User context value
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
