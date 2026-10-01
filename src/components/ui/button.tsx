import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Gulistan Naturals button hierarchy.
 * primary  -> single most important action on a surface
 * outline  -> secondary action sitting next to a primary
 * quiet    -> tertiary / inline action
 * brass    -> rare editorial emphasis
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-sans font-medium cursor-pointer select-none transition-[background-color,color,border-color,opacity] duration-200 ease-[var(--ease-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/88",
        primary: "bg-primary text-primary-foreground hover:bg-primary/88",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        brass: "bg-brass text-brass-foreground hover:bg-brass/90",
        quiet: "bg-transparent text-foreground hover:bg-secondary",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "bg-transparent text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-11 px-5 text-sm tracking-wide",
        sm: "h-9 px-3.5 text-xs tracking-wide",
        lg: "h-12 px-7 text-sm tracking-[0.08em] uppercase",
        icon: "h-11 w-11",
        iconSm: "h-9 w-9",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
