import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 font-medium active:scale-[0.99]",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-[#1f1f1f] border border-border/80 active:scale-[0.99]",
      outline:
        "border border-border bg-transparent text-foreground hover:bg-muted/60 active:scale-[0.99]",
      ghost:
        "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-[0.99]",
      destructive:
        "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 active:scale-[0.99]",
      icon:
        "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-[var(--radius)] gap-1.5",
      md: "h-9 px-4 text-xs sm:text-sm rounded-[var(--radius)] gap-2",
      lg: "h-10 px-5 text-sm rounded-[var(--radius)] gap-2.5",
      icon: "h-9 w-9 p-0 rounded-[var(--radius)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          size === "icon" || variant === "icon" ? sizeStyles.icon : sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
