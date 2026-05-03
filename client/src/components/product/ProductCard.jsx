/**
 * @fileoverview ProductCard component
 * Card component for product listings with hover effects and quick actions
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/product/Rating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn, formatPrice } from "@/lib/utils";

/**
 * ProductCard component for product grid display
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element} Product card
 */
export function ProductCard({ product, className }) {
  const { addItem, toggleCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem({
        productId: product.id,
        variantId: product.defaultVariantId,
        defaultVariantId: product.defaultVariantId,
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
      });
      toggleCart(true);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1600);
    } catch {
      /* Error surfaced via cart context */
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary/20 hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount > 0 && (
            <Badge variant="sale">-{product.discount}%</Badge>
          )}
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isBestseller && (
            <Badge variant="bestseller">Bestseller</Badge>
          )}
        </div>

        {/* Quick actions — always tappable on small screens; subtle on md+ until hover */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 transition-all duration-200 ease-out sm:translate-y-0.5 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-lg border border-border/60 shadow-sm backdrop-blur-sm"
            onClick={handleToggleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                inWishlist && "fill-red-500 text-red-500",
              )}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-lg border border-border/60 shadow-sm backdrop-blur-sm"
            asChild
          >
            <Link to={`/product/${product.slug}`} aria-label="Quick view">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Low stock indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="pointer-events-none absolute bottom-3 left-3 max-w-[min(100%,12rem)]">
            <p className="inline-block rounded-md border border-destructive/25 bg-background/90 px-2 py-1 font-sans text-[11px] font-semibold text-destructive shadow-sm backdrop-blur-sm">
              Only {product.stock} left
            </p>
          </div>
        )}
      </div>

      {/* Always-visible add to cart — hover-only overlays fail on touch / trackpad users */}
      <div className="border-t border-border/60 bg-muted/40 px-3 py-3">
        <Button
          type="button"
          size="sm"
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className={cn(
            "h-10 w-full font-heading transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.98] disabled:opacity-50",
            justAdded && "animate-cart-confirm ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
          )}
        >
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </div>

      {/* Content */}
      <div className="border-t border-border/50 p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <p className="mb-1 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {product.categoryName}
          </p>
          <h3 className="line-clamp-2 font-heading text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <Rating
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="sm"
          className="mt-2"
        />

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-lg font-bold tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-sans text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.soldThisWeek > 100 && (
          <p className="mt-2 font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {product.soldThisWeek.toLocaleString()} sold this week
          </p>
        )}
      </div>
    </Card>
  );
}

export default ProductCard;
