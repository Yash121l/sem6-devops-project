/**
 * @fileoverview ProductPage component
 * Product detail page with gallery, variants, reviews, and related products
 */

import React, { useState, useEffect } from "react";
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
import { getFallbackProductBySlug } from "@/lib/storefront";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Image gallery component with thumbnails
 */
function ProductGallery({ images, productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
        <img
          src={images[selectedIndex]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300",
              )}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
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
      <div className="flex items-center gap-2 text-destructive animate-pulse-slow">
        <Clock className="h-4 w-4" />
        <span className="font-medium">
          Only {stock} left in stock - order soon!
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
    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
      <Users className="h-4 w-4" />
      <span className="font-medium">
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
    <div className="border rounded-lg p-4">
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

  const { addItem, toggleCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    // Reset selections when product changes
    if (product) {
      setSelectedSize(product.sizes?.[0] || null);
      setSelectedColor(product.colors?.[0]?.name || null);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    toggleCart(true);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
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
      <div className="bg-muted py-4">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              to={`/category/${product.category}`}
              className="text-muted-foreground hover:text-primary"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <div className="space-y-6">
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
              <h1 className="font-heading text-2xl lg:text-3xl font-bold">
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

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="sale">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </Badge>
                </>
              )}
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
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-gray-400",
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
              <div className="flex items-center border rounded-md">
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
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>

              {/* Wishlist button */}
              <Button
                size="xl"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    inWishlist && "fill-red-500 text-red-500",
                  )}
                />
              </Button>
            </div>

            {/* Stock indicator */}
            <StockIndicator stock={product.stock} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
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

        {/* Tabs: Description, Reviews */}
        <div className="mt-12">
          <div className="border-b">
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
