import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
        label?: string;
        error?: string;
        helperText?: string;
    }

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, helperText, id, disabled, children, ...props }, ref) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                     htmlFor={selectId}
                     className="block text-xs font-medium text-muted-foreground select-none"
                    >
                        {label}
                    </label>
                )}
                <select
                 id={selectId}
                 disabled={disabled}
                 ref={ref}
                 className={cn(
                    'flex h-9 w-full cursor-pointer rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs sm:text-sm text-foreground transition-colors',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary',
                    '[&>option]:bg-card [&>option]:text-foreground',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    error && 'border-destructive/60 focus-visible:ring-destructive/30 focus-visible:border-destructive',
                    className,
                 )}
                 {...props}
                >
                    {children}
                </select>
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

Select.displayName = 'Select';