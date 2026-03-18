/**
 * @fileoverview Separator component
 * Visual divider for content sections
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Separator/divider component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'horizontal'|'vertical'} [props.orientation] - Orientation
 * @returns {JSX.Element} Separator element
 */
const Separator = React.forwardRef(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator };
