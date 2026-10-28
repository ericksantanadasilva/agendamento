import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  dotClassName?: string;
}

export function Badge({
  className,
  dotClassName,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border border/60 bg-muted/60 px-2.5 py-0.5 text-2xs font-medium text-foreground',
        className,
      )}
      {...props}
    >
      {dotClassName && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClassName)}
        />
      )}
      {children}
    </span>
  );
}
