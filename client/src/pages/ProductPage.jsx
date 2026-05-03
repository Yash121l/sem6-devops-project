/**
 * @fileoverview ProductPage component
 * Product detail page with gallery, variants, reviews, and related products
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  Check,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rating } from "@/components/product/Rating";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getReviewsByProductId } from "@/data/reviews";
import {
  useStorefrontProduct,
  useStorefrontProducts,
} from "@/hooks/useStorefront";
import { getFallbackProductBySlug, pickVariantIdForProduct } from "@/lib/storefront";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Image gallery — main stack crossfade 200ms; thumbnails 150ms border
 */
function ProductGallery({ images, productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted">
        {images.map((image, index) => (
          <img
            key={`${index}-${image}`}
            src={image}
            alt={index === selectedIndex ? productName : ""}
            aria-hidden={index !== selectedIndex}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out",
              index === selectedIndex ? "z-10 opacity-100" : "z-0 opacity-0",
            )}
            loading={index === 0 ? "eager" : "lazy"}
            draggable={false}
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "h-20 w-20 overflow-hidden rounded-lg border-2 transition-[border-color,opacity] duration-150 ease-out",
                selectedIndex === index
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-80 hover:border-border hover:opacity-100",
              )}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Stock indicator with scarcity messaging
 */
function StockIndicator({ stock }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        Out of Stock
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-sans text-sm font-medium">
          Only {stock} left in stock — ships while inventory lasts.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-success">
      <Check className="h-4 w-4" />
      In Stock
    </div>
  );
}

/**
 * Social proof badge
 */
function SocialProofBadge({ soldThisWeek }) {
  if (soldThisWeek < 50) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-foreground">
      <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <span className="font-heading font-semibold tracking-tight">
        {soldThisWeek.toLocaleString()} bought this week
      </span>
    </div>
  );
}

/**
 * Review card component
 */
function ReviewCard({ review }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <img
          src={review.userAvatar}
          alt={review.userName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{review.userName}</span>
            {review.verified && (
              <Badge variant="secondary" className="text-xs">
                Verified Purchase
              </Badge>
            )}
          </div>
          <Rating
            rating={review.rating}
            showCount={false}
            size="sm"
            className="mb-2"
          />
          <h4 className="font-medium mb-1">{review.title}</h4>
          <p className="text-sm text-muted-foreground">{review.content}</p>
          {review.images?.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Review"
                  className="w-16 h-16 rounded object-cover"
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{review.date}</span>
            <button className="hover:text-primary">
              Helpful ({review.helpful})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductPage component
 * @returns {JSX.Element} Product detail page
 */
export function ProductPage() {
  const { productSlug } = useParams();
  const { data: product } = useStorefrontProduct(productSlug);
  const fallbackProduct = getFallbackProductBySlug(productSlug);
  const { data: relatedCatalogProducts } = useStorefrontProducts({
    categoryId: product?.category,
  });
  const reviews = fallbackProduct
    ? getReviewsByProductId(fallbackProduct.id)
    : [];

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [justAdded, setJustAdded] = useState(false);
  const [buyDocked, setBuyDocked] = useState(false);
  const buySentinelRef = useRef(null);

  const { addItem, toggleCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    // Reset selections when product changes
    if (product) {
      setSelectedSize(product.sizes?.[0] || null);
      setSelectedColor(product.colors?.[0]?.name || null);
      setQuantity(1);
      setJustAdded(false);
    }
  }, [product]);

  const updateBuyDocked = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setBuyDocked(false);
      return;
    }
    const el = buySentinelRef.current;
    if (!el) return;
    setBuyDocked(el.getBoundingClientRect().top <= 96);
  }, []);

  useEffect(() => {
    updateBuyDocked();
    window.addEventListener("scroll", updateBuyDocked, { passive: true });
    window.addEventListener("resize", updateBuyDocked);
    return () => {
      window.removeEventListener("scroll", updateBuyDocked);
      window.removeEventListener("resize", updateBuyDocked);
    };
  }, [product, updateBuyDocked]);

  if (!product) {
    return (
      <div className="container-custom py-16 text-center lg:py-24">
        <h1 className="mb-4 font-heading text-2xl font-extrabold tracking-tight">
          Product not found
        </h1>
        <p className="mb-6 text-muted-foreground">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    const variantId = pickVariantIdForProduct(
      product,
      selectedSize,
      selectedColor,
    );
    try {
      await addItem({
        productId: product.id,
        variantId,
        defaultVariantId: product.defaultVariantId,
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      toggleCart(true);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1600);
    } catch {
      /* cartError in context */
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
  };

  // Get related products (same category, excluding current)
  const relatedProducts = relatedCatalogProducts
    .filter((relatedProduct) => relatedProduct.slug !== product.slug)
    .slice(0, 4);

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
            <Link
              to={`/category/${product.category}`}
              className="transition-colors hover:text-primary"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <span className="truncate font-medium text-foreground max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-16 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          <div className="min-w-0">
            <div
              ref={buySentinelRef}
              className="pointer-events-none hidden h-px w-full lg:block"
              aria-hidden
            />
            {/* Buy column — sticky + dock cue when stuck */}
            <div
              className={cn(
                "space-y-6 lg:sticky lg:top-24 lg:z-20 lg:self-start lg:transition-[box-shadow,border-color,background-color] lg:duration-200 lg:ease-out",
                buyDocked &&
                  "lg:-mx-1 lg:rounded-b-xl lg:border-t lg:border-border/70 lg:bg-background/95 lg:px-1 lg:pb-1 lg:pt-4 lg:shadow-[0_8px_24px_-12px_oklch(22%_0.045_265_/_0.12)]",
              )}
            >
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isNew && <Badge variant="new">New Arrival</Badge>}
              {product.isBestseller && (
                <Badge variant="bestseller">Bestseller</Badge>
              )}
              {product.discount > 0 && (
                <Badge variant="sale">-{product.discount}% OFF</Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl lg:font-black">
                {product.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <Rating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
              <a
                href="#reviews"
                className="text-sm text-primary hover:underline"
              >
                Read reviews
              </a>
            </div>

            {/* Social proof */}
            <SocialProofBadge soldThisWeek={product.soldThisWeek} />

            {/* Price — compare-at + savings inline */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-heading text-3xl font-bold tracking-tight text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice ? (
                <>
                  <span className="font-sans text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="font-sans text-sm font-medium text-primary">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              ) : null}
            </div>

            <Separator />

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color:{" "}
                  <span className="text-muted-foreground">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        selectedColor === color.name
                          ? "border-primary"
                          : "border-border hover:border-primary/40",
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "min-w-[48px] h-10 px-3 rounded-md border font-medium transition-all",
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:border-primary",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-wrap gap-4">
              {/* Quantity selector */}
              <div className="flex items-center overflow-hidden rounded-md border border-border/80">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 min-w-[3rem] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-3 hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to cart button */}
              <Button
                size="xl"
                className={cn(
                  "flex-1",
                  justAdded &&
                    "animate-cart-confirm ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                )}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                data-testid="product-add-to-cart"
              >
                <ShoppingCart className="mr-2 h-5 w-5" aria-hidden />
                {product.stock === 0 ? "Out of stock" : "Add to cart"}
              </Button>

              {/* Wishlist button */}
              <Button
                size="xl"
                variant="outline"
                onClick={handleToggleWishlist}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
                data-testid="product-toggle-wishlist"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    inWishlist && "fill-primary text-primary",
                  )}
                />
              </Button>
            </div>

            {/* Stock indicator */}
            <StockIndicator stock={product.stock} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-border/70 bg-muted/50 p-4">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Orders $75+</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30 Days</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Secure Checkout</p>
                <p className="text-xs text-muted-foreground">SSL Encrypted</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Tabs: Description, Reviews */}
        <div className="mt-12">
          <div className="border-b border-border/80">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("description")}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "description"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                id="reviews"
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Reviews ({product.reviewCount})
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p>{product.fullDescription}</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-bold mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
