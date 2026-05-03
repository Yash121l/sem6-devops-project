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
  "inline-flex items-center rounded-md border px-2 py-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/85",
        secondary:
          "border-border/80 bg-muted text-foreground hover:bg-muted/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        outline: "border-border/80 bg-transparent text-foreground",
        sale: "border-destructive/40 bg-destructive/10 text-destructive",
        new: "border-primary/50 bg-primary/10 text-primary",
        bestseller: "border-amber-600/40 bg-amber-500/10 text-amber-950",
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
