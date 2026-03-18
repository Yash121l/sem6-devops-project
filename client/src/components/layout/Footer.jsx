/**
 * @fileoverview Footer component
 * Site footer with links, newsletter, and trust badges
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Footer component
 * @returns {JSX.Element} Footer element
 */
export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust badges */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-white">Free Shipping</h4>
              <p className="text-sm">On orders over $75</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RotateCcw className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-white">Easy Returns</h4>
              <p className="text-sm">30-day return policy</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-white">Secure Checkout</h4>
              <p className="text-sm">SSL encrypted payments</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-white">Payment Options</h4>
              <p className="text-sm">All major cards accepted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-bold text-white">
                ShopSmart
              </span>
            </Link>
            <p className="text-sm mb-4">
              Your one-stop destination for quality products at great prices.
              Shop with confidence and enjoy fast, free shipping.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                123 Commerce St, New York, NY 10001
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (555) 123-4567
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                hello@shopsmart.com
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/category/electronics"
                  className="hover:text-primary transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/category/clothing"
                  className="hover:text-primary transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  to="/category/accessories"
                  className="hover:text-primary transition-colors"
                >
                  Sale Items
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-primary transition-colors"
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-primary transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Stay Connected</h4>
            <p className="text-sm mb-4">
              Subscribe to get special offers, free giveaways, and new arrivals.
            </p>
            {subscribed ? (
              <p className="text-sm text-success">Thanks for subscribing! 🎉</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </form>
            )}

            {/* Social links */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} ShopSmart. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Payment icons - using text as placeholder */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-gray-800 rounded">Visa</span>
                <span className="px-2 py-1 bg-gray-800 rounded">
                  Mastercard
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded">PayPal</span>
                <span className="px-2 py-1 bg-gray-800 rounded">Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
