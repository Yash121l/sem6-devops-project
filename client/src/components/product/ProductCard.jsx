/**
 * @fileoverview ProductCard component
 * Card component for product listings with hover effects and quick actions
 */

import React from "react";
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

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
    toggleCart(true);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  return (
    <Card className={cn("group relative overflow-hidden", className)}>
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-md"
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
            className="h-9 w-9 rounded-full shadow-md"
            asChild
          >
            <Link to={`/product/${product.slug}`} aria-label="Quick view">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button className="w-full" size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>

        {/* Low stock indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-0">
            <p className="text-xs text-destructive font-medium bg-white/90 rounded px-2 py-1 inline-block">
              Only {product.stock} left!
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <p className="text-xs text-muted-foreground mb-1">
            {product.categoryName}
          </p>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <Rating
          rating={product.rating}
          reviewCount={product.reviewCount}
          size="sm"
          className="mt-2"
        />

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Social proof */}
        {product.soldThisWeek > 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            🔥 {product.soldThisWeek.toLocaleString()} sold this week
          </p>
        )}
      </div>
    </Card>
  );
}

export default ProductCard;
