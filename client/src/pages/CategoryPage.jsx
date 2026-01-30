/**
 * @fileoverview CategoryPage component
 * Product listing page with filters and sorting
 */

import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, Grid, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { getCategoryById, categories } from "@/data/categories";
import { cn } from "@/lib/utils";

/**
 * Filter sidebar component
 */
function FilterSidebar({ filters, setFilters, onClose, isMobile }) {
  const priceRanges = [
    { label: "Under $25", min: 0, max: 25 },
    { label: "$25 - $50", min: 25, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Over $200", min: 200, max: Infinity },
  ];

  const ratings = [4, 3, 2, 1];

  return (
    <div className={cn("space-y-6", isMobile && "p-4")}>
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceMin === range.min && filters.priceMax === range.max}
                onChange={() => setFilters({ ...filters, priceMin: range.min, priceMax: range.max })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
          <button
            onClick={() => setFilters({ ...filters, priceMin: 0, priceMax: Infinity })}
            className="text-sm text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-3">Rating</h4>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => setFilters({ ...filters, minRating: rating })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm flex items-center gap-1">
                {rating}+ stars
                <span className="text-yellow-400">★</span>
              </span>
            </label>
          ))}
          <button
            onClick={() => setFilters({ ...filters, minRating: 0 })}
            className="text-sm text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h4 className="font-medium mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
            className="text-primary focus:ring-primary rounded"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      <Separator />

      {/* Sale Items */}
      <div>
        <h4 className="font-medium mb-3">Special Offers</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => setFilters({ ...filters, onSaleOnly: e.target.checked })}
            className="text-primary focus:ring-primary rounded"
          />
          <span className="text-sm">On Sale</span>
        </label>
      </div>

      {isMobile && (
        <Button className="w-full" onClick={onClose}>
          Apply Filters
        </Button>
      )}
    </div>
  );
}

/**
 * CategoryPage component
 * @returns {JSX.Element} Category page
 */
export function CategoryPage() {
  const { categoryId } = useParams();
  const category = getCategoryById(categoryId);

  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: Infinity,
    minRating: 0,
    inStockOnly: false,
    onSaleOnly: false,
  });
  const [sortBy, setSortBy] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = categoryId
      ? products.filter((p) => p.category === categoryId)
      : products;

    // Apply filters
    result = result.filter((p) => {
      if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
      if (p.rating < filters.minRating) return false;
      if (filters.inStockOnly && p.stock === 0) return false;
      if (filters.onSaleOnly && p.discount === 0) return false;
      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "popular":
      default:
        result.sort((a, b) => b.soldThisWeek - a.soldThisWeek);
    }

    return result;
  }, [categoryId, filters, sortBy]);

  const activeFilterCount = [
    filters.priceMin > 0 || filters.priceMax < Infinity,
    filters.minRating > 0,
    filters.inStockOnly,
    filters.onSaleOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: Infinity,
      minRating: 0,
      inStockOnly: false,
      onSaleOnly: false,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted py-4">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{category?.name || "All Products"}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">
              {category?.name || "All Products"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Grid size toggle */}
            <div className="hidden md:flex items-center gap-1 border rounded-md">
              <button
                onClick={() => setGridCols(3)}
                className={cn(
                  "p-2 rounded-l-md",
                  gridCols === 3 ? "bg-primary text-white" : "hover:bg-muted"
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={cn(
                  "p-2 rounded-r-md",
                  gridCols === 4 ? "bg-primary text-white" : "hover:bg-muted"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {(filters.priceMin > 0 || filters.priceMax < Infinity) && (
              <Badge variant="secondary">
                ${filters.priceMin} - {filters.priceMax === Infinity ? "∞" : `$${filters.priceMax}`}
                <button
                  onClick={() => setFilters({ ...filters, priceMin: 0, priceMax: Infinity })}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge variant="secondary">
                {filters.minRating}+ stars
                <button onClick={() => setFilters({ ...filters, minRating: 0 })} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.inStockOnly && (
              <Badge variant="secondary">
                In Stock
                <button onClick={() => setFilters({ ...filters, inStockOnly: false })} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.onSaleOnly && (
              <Badge variant="secondary">
                On Sale
                <button onClick={() => setFilters({ ...filters, onSaleOnly: false })} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button onClick={clearAllFilters} className="text-sm text-primary hover:underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="container-custom pb-16">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found matching your criteria.
                </p>
                <Button onClick={clearAllFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4 lg:gap-6",
                  gridCols === 3
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 lg:grid-cols-4"
                )}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-background z-50 lg:hidden overflow-y-auto">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onClose={() => setShowMobileFilters(false)}
              isMobile
            />
          </div>
        </>
      )}
    </div>
  );
}

export default CategoryPage;
