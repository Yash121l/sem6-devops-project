/**
 * @fileoverview Main App component with routing
 * E-commerce application entry point
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { UserProvider } from "@/context/UserContext";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import WishlistPage from "@/pages/WishlistPage";
import LoginPage from "@/pages/LoginPage";

/**
 * App component - root of the application
 * @returns {JSX.Element} App with providers and routing
 */
function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Main layout routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="category/:categoryId" element={<CategoryPage />} />
                <Route path="product/:productSlug" element={<ProductPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="login" element={<LoginPage />} />
              </Route>
              
              {/* Checkout flow (minimal layout) */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
