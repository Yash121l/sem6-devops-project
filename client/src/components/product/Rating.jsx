/**
 * @fileoverview Rating component
 * Displays star ratings with optional review count
 */

import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn, getStarRating } from "@/lib/utils";

/**
 * Rating component - displays star rating
 * @param {Object} props
 * @param {number} props.rating - Rating value (0-5)
 * @param {number} [props.reviewCount] - Number of reviews
 * @param {boolean} [props.showCount] - Whether to show review count
 * @param {'sm'|'md'|'lg'} [props.size] - Star size
 * @param {string} [props.className] - Additional classes
 * @returns {JSX.Element} Rating display
 */
export function Rating({
  rating,
  reviewCount,
  showCount = true,
  size = "md",
  className,
}) {
  const stars = getStarRating(rating);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {stars.map((type, index) => (
          <span key={index} className="text-yellow-400">
            {type === "full" ? (
              <Star className={cn(sizeClasses[size], "fill-current")} />
            ) : type === "half" ? (
              <StarHalf className={cn(sizeClasses[size], "fill-current")} />
            ) : (
              <Star className={cn(sizeClasses[size], "text-gray-300")} />
            )}
          </span>
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default Rating;
