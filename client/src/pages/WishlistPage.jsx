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

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toggleCart(true);
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto text-center">
          <HeartOff className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-heading text-2xl font-bold mb-3">
            Your Wishlist is Empty
          </h1>
          <p className="text-muted-foreground mb-6">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          My Wishlist ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
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
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <Link to={`/product/${item.slug || item.id}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-destructive hover:text-white transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <Link to={`/product/${item.slug || item.id}`}>
                <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                  {item.name}
                </h3>
              </Link>
              <p className="text-lg font-bold mt-2">
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
