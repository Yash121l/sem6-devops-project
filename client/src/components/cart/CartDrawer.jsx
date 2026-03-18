/**
 * @fileoverview Cart Drawer component
 * Slide-out cart panel with items and checkout CTA
 */

import React from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

/**
 * Free shipping progress bar component
 * @param {Object} props
 * @param {number} props.current - Current cart subtotal
 * @param {number} props.threshold - Free shipping threshold
 */
function FreeShippingBar({ current, threshold }) {
  const progress = Math.min((current / threshold) * 100, 100);
  const remaining = Math.max(threshold - current, 0);

  return (
    <div className="bg-muted p-3 rounded-lg">
      {remaining > 0 ? (
        <>
          <p className="text-sm mb-2">
            Add{" "}
            <span className="font-semibold text-primary">
              {formatPrice(remaining)}
            </span>{" "}
            more for <span className="font-semibold">FREE shipping!</span>
          </p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-success font-medium">
          🎉 You've unlocked FREE shipping!
        </p>
      )}
    </div>
  );
}

/**
 * Cart item row component
 * @param {Object} props
 * @param {Object} props.item - Cart item
 */
function CartItemRow({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.name}</h4>
        {(item.size || item.color) && (
          <p className="text-xs text-muted-foreground mt-1">
            {item.size && `Size: ${item.size}`}
            {item.size && item.color && " / "}
            {item.color && `Color: ${item.color}`}
          </p>
        )}
        <p className="text-sm font-semibold mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center gap-2 mt-2">
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
              className="p-1 hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm min-w-[2rem] text-center">
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
              className="p-1 hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id, item.size, item.color)}
            className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Cart Drawer component - slide-out panel
 * @returns {JSX.Element} Cart drawer
 */
export function CartDrawer() {
  const {
    items,
    isOpen,
    toggleCart,
    subtotal,
    freeShippingThreshold,
    itemCount,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => toggleCart(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({itemCount})
          </h2>
          <Button variant="ghost" size="icon" onClick={() => toggleCart(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Looks like you haven't added anything yet.
              </p>
              <Button onClick={() => toggleCart(false)} asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <FreeShippingBar
                current={subtotal}
                threshold={freeShippingThreshold}
              />
              <div className="divide-y mt-4">
                {items.map((item, index) => (
                  <CartItemRow
                    key={`${item.id}-${item.size}-${item.color}-${index}`}
                    item={item}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="grid gap-2">
              <Button size="lg" asChild onClick={() => toggleCart(false)}>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleCart(false)}
                asChild
              >
                <Link to="/cart">View Cart</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
