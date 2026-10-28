'use client';

import * as React from 'react';
import {
  getDayHours,
  HOUR_HEIGHT,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
  getCalendarHeight,
} from './utils';
import { cn } from '@/lib/utils';

export interface TimeColumnProps {
  startHour?: number;
  endHour?: number;
  className?: string;
}

export function TimeColumn({
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  className,
}: TimeColumnProps) {
  const hours = React.useMemo(
    () => getDayHours(startHour, endHour),
    [startHour, endHour],
  );
  const columnHeight = getCalendarHeight(startHour, endHour);

  return (
    <div
      className={cn(
        'sticky left-0 z-20 bg-card border-r border-border/30 w-12 sm:w-16 shrink-0 select-none flex flex-col relative',
        className,
      )}
      style={{ height: `${columnHeight}px` }}
    >
      {hours.map(({ hour, label }, index) => {
        const top = index * HOUR_HEIGHT;

        return (
          <div
            key={hour}
            style={{ top: `${top}px` }}
            className={cn(
              'absolute inset-x-0 flex items-start justify-end pr-2.5 sm:pr-3 pointer-events-none',
              index === 0 ? 'pt-1' : '-translate-y-2',
            )}
          >
            <span className='font-mono text-3xs text-muted-foreground/50 tracking-tight leading-none'>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
