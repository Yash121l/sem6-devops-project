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
  Shield,
  CreditCard,
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
    <div className="rounded-xl border border-border/80 bg-muted/60 p-4">
      {remaining > 0 ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" aria-hidden />
            <p className="text-sm">
              Add{" "}
              <span className="font-semibold text-primary">
                {formatPrice(remaining)}
              </span>{" "}
              more for <span className="font-semibold">free shipping</span>
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-success">
          <Truck className="h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">
            You&apos;ve unlocked free shipping on this order.
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
  const productPath = `/product/${item.slug || item.id}`;

  return (
    <div className="flex gap-4 py-6">
      <Link to={productPath} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60 sm:h-[5.25rem] sm:w-[5.25rem]">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to={productPath}
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
          <div className="flex min-h-11 items-stretch overflow-hidden rounded-md border border-border/80">
            <button
              onClick={() =>
                updateQuantity(
                  item.id,
                  item.quantity - 1,
                  item.size,
                  item.color,
                  item.cartItemId,
                )
              }
              className="flex min-w-11 items-center justify-center px-2 hover:bg-muted transition-colors duration-200 ease-out"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex min-w-[2.75rem] items-center justify-center px-3 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(
                  item.id,
                  item.quantity + 1,
                  item.size,
                  item.color,
                  item.cartItemId,
                )
              }
              className="flex min-w-11 items-center justify-center px-2 hover:bg-muted transition-colors duration-200 ease-out"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() =>
              removeItem(item.id, item.size, item.color, item.cartItemId)
            }
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
function OrderSummary({ subtotal, hasFreeShipping, serverTotals }) {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const useServer = Boolean(serverTotals);
  const shipping = useServer
    ? serverTotals.shippingAmount
    : hasFreeShipping
      ? 0
      : 9.99;
  const discount = useServer
    ? serverTotals.discountAmount
    : promoApplied
      ? subtotal * 0.1
      : 0;
  const tax = useServer ? serverTotals.taxAmount : (subtotal - discount) * 0.08;
  const total = useServer
    ? serverTotals.total
    : subtotal - discount + shipping + tax;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
    }
  };

  return (
    <Card className="sticky top-24 border-border/80 p-6 shadow-sm">
      <p className="mb-1 font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
        Before you pay
      </p>
      <h2 className="mb-4 font-heading text-xl font-extrabold tracking-tight">
        Order summary
      </h2>

      {!useServer && (
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
      )}

      <Separator className="my-4" />

      {/* Summary lines */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {(useServer ? discount > 0 : promoApplied) && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
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
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
          Secure checkout
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-primary" aria-hidden />
          Major cards accepted
        </span>
      </div>
    </Card>
  );
}

/**
 * CartPage component
 * @returns {JSX.Element} Cart page
 */
export function CartPage() {
  const {
    items,
    subtotal,
    hasFreeShipping,
    freeShippingThreshold,
    clearCart,
    serverMode,
    serverTotals,
  } = useCart();

  // Get recommended products (random selection from products not in cart)
  const recommendedProducts = products
    .filter((p) => !items.find((item) => item.id === p.id))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 lg:py-24">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-6 h-20 w-20 text-muted-foreground" aria-hidden />
          <h1 className="mb-3 font-heading text-2xl font-bold tracking-tight text-foreground">
            Your bag is empty
          </h1>
          <p className="mb-6 font-sans text-muted-foreground">
            When you&apos;re ready, the edit is one tap away.
          </p>
          <Button size="lg" asChild>
            <Link to="/">Browse the shop</Link>
          </Button>
        </div>

        {/* Recommended products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="mb-6 text-center font-heading text-2xl font-bold tracking-tight text-foreground">
              You might like
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
      <div className="border-b border-border/60 bg-background py-3">
        <div className="container-custom">
          <nav className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <span className="font-medium text-foreground">Shopping cart</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-16 lg:py-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
              Bag
            </p>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
              Shopping cart ({items.length}{" "}
              {items.length === 1 ? "item" : "items"})
            </h1>
          </div>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              void clearCart();
            }}
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
                  key={
                    item.cartItemId ||
                    `${item.id}-${item.size}-${item.color}-${index}`
                  }
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
              serverTotals={serverMode ? serverTotals : null}
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
