"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-garden-green text-garden-cream shadow-sm hover:bg-garden-green-dark active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-garden-earth bg-transparent text-garden-forest hover:bg-garden-cream-dark hover:border-garden-earth-dark",
        secondary:
          "bg-garden-earth text-white shadow-sm hover:bg-garden-earth-dark",
        ghost:
          "text-garden-forest hover:bg-garden-cream-dark hover:text-garden-green",
        link: "text-garden-green underline-offset-4 hover:underline",
        garden:
          "bg-gradient-to-r from-garden-green to-garden-green-light text-garden-cream shadow-md hover:shadow-lg hover:from-garden-green-dark hover:to-garden-green active:scale-[0.98] font-semibold",
        "garden-outline":
          "border-2 border-garden-green text-garden-green hover:bg-garden-green hover:text-garden-cream transition-colors",
        "cream":
          "bg-garden-cream text-garden-green border border-garden-earth-light hover:bg-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
