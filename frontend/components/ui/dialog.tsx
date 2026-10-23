"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface DialogProps {
    title: string;
    eyebrow?: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Dialog({
    title,
    eyebrow,
    onClose,
    children,
    footer,
    className,
}: DialogProps) {
    const titleId = React.useId();

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-background/80 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "flex max-h-[90vh] w-full max-w-md cursor-default flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-xl shadow-black/40",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
          <div className="space-y-0.5">
            {eyebrow && (
              <span className="font-mono text-3xs uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </span>
            )}
            <h2
              id={titleId}
              className="text-sm font-semibold text-foreground sm:text-base"
            >
              {title}
            </h2>
          </div>
          <Button
            type="button"
            variant="icon"
            size="icon"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}