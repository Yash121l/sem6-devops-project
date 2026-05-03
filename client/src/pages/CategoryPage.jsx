/**
 * @fileoverview CategoryPage component
 * Product listing page with filters and sorting
 */

import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  SlidersHorizontal,
  Grid,
  LayoutGrid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import {
  useStorefrontCategories,
  useStorefrontProducts,
} from "@/hooks/useStorefront";
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
          <h3 className="font-heading text-lg font-bold">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="mb-3 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Price range
        </h4>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label
              key={index}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.priceMin === range.min &&
                  filters.priceMax === range.max
                }
                onChange={() =>
                  setFilters({
                    ...filters,
                    priceMin: range.min,
                    priceMax: range.max,
                  })
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
          <button
            onClick={() =>
              setFilters({ ...filters, priceMin: 0, priceMax: Infinity })
            }
            className="text-sm text-primary hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <h4 className="mb-3 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Rating
        </h4>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => setFilters({ ...filters, minRating: rating })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm flex items-center gap-1">
                {rating}+ stars
                <span className="text-primary/70">★</span>
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
        <h4 className="mb-3 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Availability
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters({ ...filters, inStockOnly: e.target.checked })
            }
            className="text-primary focus:ring-primary rounded"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      <Separator />

      {/* Sale Items */}
      <div>
        <h4 className="mb-3 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Special offers
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) =>
              setFilters({ ...filters, onSaleOnly: e.target.checked })
            }
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
  const { data: categories } = useStorefrontCategories();
  const { data: categoryProducts } = useStorefrontProducts({ categoryId });
  const category = categories.find((entry) => entry.id === categoryId);

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
    let result = categoryId ? [...categoryProducts] : [...categoryProducts];

    // Apply filters
    result = result.filter((p) => {
      if (p.price < filters.priceMin || p.price > filters.priceMax)
        return false;
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
  }, [categoryId, categoryProducts, filters, sortBy]);

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
      <div className="border-b border-border/60 bg-background py-3">
        <div className="container-custom">
          <nav className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <span className="font-medium text-foreground">
              {category?.name || "All Products"}
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="container-custom py-16 lg:py-24">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
              Catalog
            </p>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight">
              {category?.name || "All Products"}
            </h1>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
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
            <div className="hidden items-center gap-0 overflow-hidden rounded-lg border border-border/80 md:flex">
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={cn(
                  "p-2 transition-colors duration-150 ease-out",
                  gridCols === 3
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={cn(
                  "border-l border-border/80 p-2 transition-colors duration-150 ease-out",
                  gridCols === 4
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
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
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {(filters.priceMin > 0 || filters.priceMax < Infinity) && (
              <Badge variant="secondary">
                ${filters.priceMin} -{" "}
                {filters.priceMax === Infinity ? "∞" : `$${filters.priceMax}`}
                <button
                  onClick={() =>
                    setFilters({ ...filters, priceMin: 0, priceMax: Infinity })
                  }
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.minRating > 0 && (
              <Badge variant="secondary">
                {filters.minRating}+ stars
                <button
                  onClick={() => setFilters({ ...filters, minRating: 0 })}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.inStockOnly && (
              <Badge variant="secondary">
                In Stock
                <button
                  onClick={() => setFilters({ ...filters, inStockOnly: false })}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.onSaleOnly && (
              <Badge variant="secondary">
                On Sale
                <button
                  onClick={() => setFilters({ ...filters, onSaleOnly: false })}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="container-custom pb-16 lg:pb-24">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24">
              <Card className="border-border/80 p-4 shadow-sm">
                <FilterSidebar filters={filters} setFilters={setFilters} />
              </Card>
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
                    : "grid-cols-2 lg:grid-cols-4",
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
            className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 ease-out lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto border-r border-border/80 bg-background shadow-xl transition-transform duration-[250ms] ease-out lg:hidden">
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
