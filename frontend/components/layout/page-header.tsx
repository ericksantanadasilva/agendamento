import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-border/70',
        className,
      )}
    >
      <div className='space-y-1.5'>
        <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
          {title}
        </h1>
        {description && (
          <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl'>
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className='flex items-center gap-2.5 shrink-0 pt-1'>{action}</div>
      )}
    </div>
  );
}
