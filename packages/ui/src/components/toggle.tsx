"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-transparent hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        outline:
          "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        onboarding:
          "border border-gray-100 bg-background text-body-b1-500 text-gray-900 hover:bg-background hover:text-gray-900 data-[state=on]:border-primary data-[state=on]:bg-blue-50 data-[state=on]:text-gray-900",
        chat: "bg-background text-body-b2-500 text-gray-900 hover:bg-background data-[state=on]:bg-background data-[state=on]:text-gray-900 disabled:bg-gray-100 disabled:text-gray-300 disabled:opacity-100 disabled:data-[state=on]:bg-gray-100 disabled:data-[state=on]:text-gray-300",
      },
      size: {
        default: "h-10 min-w-10 px-3",
        sm: "h-9 min-w-9 px-2",
        lg: "h-11 min-w-11 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    compoundVariants: [
      {
        variant: "onboarding",
        size: "default",
        className: "h-auto min-w-0 w-full justify-start rounded-[12px] px-4 py-[14px]",
      },
    ],
  },
);

export interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

export function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root className={cn(toggleVariants({ variant, size }), className)} {...props} />
  );
}

export { toggleVariants };
