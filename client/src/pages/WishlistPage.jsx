/**
 * @fileoverview WishlistPage component
 * Displays user's wishlist items
 */

import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

/**
 * WishlistPage component
 * @returns {JSX.Element} Wishlist page
 */
export function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem, toggleCart } = useCart();

  const handleAddToCart = async (item) => {
    try {
      await addItem({
        productId: item.id,
        variantId: item.defaultVariantId,
        defaultVariantId: item.defaultVariantId,
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
      toggleCart(true);
    } catch {
      /* cart context error */
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="mx-auto max-w-md text-center">
          <HeartOff
            className="mx-auto mb-6 h-20 w-20 text-muted-foreground"
            aria-hidden
          />
          <h1 className="mb-3 font-heading text-2xl font-extrabold tracking-tight">
            Your wishlist is empty
          </h1>
          <p className="mb-6 font-sans text-muted-foreground">
            Save items you love by clicking the heart icon on any product.
          </p>
          <Button size="lg" asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/80 bg-card text-primary shadow-sm">
            <Heart className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
              Saved
            </p>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight lg:text-3xl">
              Wishlist ({items.length}{" "}
              {items.length === 1 ? "item" : "items"})
            </h1>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-destructive"
          onClick={clearWishlist}
        >
          Clear All
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square bg-muted">
              <Link to={`/product/${item.slug || item.id}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute right-3 top-3 rounded-full border border-border/80 bg-background/95 p-2 shadow-sm transition-colors hover:border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="p-4">
              <Link to={`/product/${item.slug || item.id}`}>
                <h3 className="line-clamp-2 font-heading font-semibold tracking-tight transition-colors hover:text-primary">
                  {item.name}
                </h3>
              </Link>
              <p className="mt-2 font-heading text-lg font-bold tracking-tight">
                {formatPrice(item.price)}
              </p>
              <Button
                className="w-full mt-4"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
