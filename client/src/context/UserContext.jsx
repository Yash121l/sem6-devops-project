/**
 * @fileoverview User Context Provider
 * Manages user authentication state (mock implementation)
 */

import React, { createContext, useContext, useState, useEffect } from "react";

const USER_STORAGE_KEY = "shopsmart_user";

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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mock login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock validation
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    const mockUser = {
      id: "user_1",
      name: email.split("@")[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    setUser(mockUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true };
  };

  /**
   * Mock register function
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const register = async (name, email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    const mockUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    setUser(mockUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true };
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
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
