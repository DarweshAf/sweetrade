import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SweeTrade shared button styles. All variants use the existing storefront
 * color tokens; no unrelated brand variables or fonts are required.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-sans font-semibold cursor-pointer select-none transition-[background-color,color,border-color,opacity,transform] duration-200 ease-out active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/88",
        primary: "bg-primary text-primary-foreground hover:bg-primary/88",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
        brass: "bg-secondary text-secondary-foreground hover:bg-accent",
        quiet: "bg-transparent text-foreground hover:bg-secondary",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "bg-transparent text-primary underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "min-h-11 px-4 text-sm",
        sm: "min-h-10 px-3 text-sm",
        lg: "min-h-12 px-5 text-sm",
        icon: "h-11 w-11",
        iconSm: "h-10 w-10",
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
