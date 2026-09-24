import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-muted-foreground select-none"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          disabled={disabled}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs sm:text-sm text-foreground transition-colors",
            "placeholder:text-muted-foreground/50",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-destructive/60 focus-visible:ring-destructive/30 focus-visible:border-destructive text-destructive",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-2xs text-destructive mt-1 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-2xs text-muted-foreground mt-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
