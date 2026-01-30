/**
 * @fileoverview Main Layout component
 * Wraps pages with Header, Footer, and Cart Drawer
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

/**
 * Layout component - provides consistent page structure
 * @returns {JSX.Element} Layout wrapper
 */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default Layout;
