/**
 * @fileoverview Badge component with variants
 * Small status indicator component
 */

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge variants configuration
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        outline: "text-foreground",
        sale: "border-transparent bg-red-500 text-white",
        new: "border-transparent bg-emerald-500 text-white",
        bestseller: "border-transparent bg-amber-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Badge component for displaying status or labels
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'default'|'secondary'|'destructive'|'success'|'warning'|'outline'|'sale'|'new'|'bestseller'} [props.variant] - Badge variant
 * @returns {JSX.Element} Badge element
 */
function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
