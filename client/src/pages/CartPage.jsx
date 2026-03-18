/**
 * @fileoverview CartPage component
 * Full cart page with items, summary, and checkout CTA
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  Truck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";

/**
 * Free shipping progress bar
 */
function FreeShippingProgress({ current, threshold }) {
  const progress = Math.min((current / threshold) * 100, 100);
  const remaining = Math.max(threshold - current, 0);

  return (
    <div className="bg-muted p-4 rounded-lg">
      {remaining > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-primary" />
            <p className="text-sm">
              Add{" "}
              <span className="font-semibold text-primary">
                {formatPrice(remaining)}
              </span>{" "}
              more for <span className="font-semibold">FREE shipping!</span>
            </p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-success">
          <Truck className="h-5 w-5" />
          <p className="text-sm font-medium">
            🎉 You've unlocked FREE shipping!
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Cart item row
 */
function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-6">
      <Link to={`/product/${item.id}`} className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to={`/product/${item.id}`}
              className="font-medium hover:text-primary line-clamp-2"
            >
              {item.name}
            </Link>
            {(item.size || item.color) && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.size && `Size: ${item.size}`}
                {item.size && item.color && " / "}
                {item.color && `Color: ${item.color}`}
              </p>
            )}
          </div>
          <p className="font-semibold whitespace-nowrap">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() =>
                updateQuantity(
                  item.id,
                  item.quantity - 1,
                  item.size,
                  item.color,
                )
              }
              className="p-2 hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 min-w-[2.5rem] text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(
                  item.id,
                  item.quantity + 1,
                  item.size,
                  item.color,
                )
              }
              className="p-2 hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id, item.size, item.color)}
            className="text-muted-foreground hover:text-destructive transition-colors p-2"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Order summary card
 */
function OrderSummary({ subtotal, hasFreeShipping }) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const shipping = hasFreeShipping ? 0 : 9.99;
  const discount = promoApplied ? subtotal * 0.1 : 0; // 10% discount
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + shipping + tax;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
    }
  };

  return (
    <Card className="p-6 sticky top-24">
      <h2 className="font-heading text-xl font-bold mb-4">Order Summary</h2>

      {/* Promo code */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Promo Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleApplyPromo}>
            Apply
          </Button>
        </div>
        {promoError && (
          <p className="text-xs text-destructive mt-1">{promoError}</p>
        )}
        {promoApplied && (
          <p className="text-xs text-success mt-1">
            Code applied! 10% discount
          </p>
        )}
      </div>

      <Separator className="my-4" />

      {/* Summary lines */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {promoApplied && (
          <div className="flex justify-between text-success">
            <span>Promo Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{hasFreeShipping ? "FREE" : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Est. Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button size="lg" className="w-full mt-6" asChild>
        <Link to="/checkout">
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <span>🔒 Secure Checkout</span>
        <span>💳 All cards accepted</span>
      </div>
    </Card>
  );
}

/**
 * CartPage component
 * @returns {JSX.Element} Cart page
 */
export function CartPage() {
  const { items, subtotal, hasFreeShipping, freeShippingThreshold, clearCart } =
    useCart();

  // Get recommended products (random selection from products not in cart)
  const recommendedProducts = products
    .filter((p) => !items.find((item) => item.id === p.id))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-heading text-2xl font-bold mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet. Start
            shopping and find something you'll love!
          </p>
          <Button size="lg" asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>

        {/* Recommended products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold mb-6 text-center">
              Popular Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-muted py-4">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl lg:text-3xl font-bold">
            Shopping Cart ({items.length}{" "}
            {items.length === 1 ? "item" : "items"})
          </h1>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        <FreeShippingProgress
          current={subtotal}
          threshold={freeShippingThreshold}
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="divide-y">
              {items.map((item, index) => (
                <CartItem
                  key={`${item.id}-${item.size}-${item.color}-${index}`}
                  item={item}
                />
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <OrderSummary
              subtotal={subtotal}
              hasFreeShipping={hasFreeShipping}
            />
          </div>
        </div>

        {/* You may also like */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
