'use client';

import * as React from 'react';
import { StudioResource } from '@/types/calendar';
import { getStudioConfig } from './studio-config';
import { cn } from '@/lib/utils';

export interface StudioFilterProps {
  resources: StudioResource[];
  selectedResourceId?: string; // "all" | id
  onSelectResource?: (resourceId: string) => void;
  className?: string;
}

export function StudioFilter({
  resources,
  selectedResourceId = 'all',
  onSelectResource,
  className,
}: StudioFilterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs select-none',
        className,
      )}
      aria-label='Filtro de visualização por estúdio'
    >
      <span className='text-3xs uppercase tracking-wider text-muted-foreground/60 font-mono shrink-0 mr-1 hidden sm:inline'>
        Visualizar:
      </span>

      {/* Botão Todos os Estúdios */}
      <button
        type='button'
        onClick={() => onSelectResource?.('all')}
        className={cn(
          'px-2.5 py-1 rounded-[var(--radius)] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border',
          selectedResourceId === 'all'
            ? 'bg-card text-foreground border-border/80 shadow-xs'
            : 'bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/40',
        )}
      >
        Todos os Estúdios
      </button>

      {/* Botões individuais por estúdio com indicador de cor */}
      {resources.map((res) => {
        const config = getStudioConfig(res.id, resources);
        const isSelected = selectedResourceId === res.id;

        return (
          <button
            key={res.id}
            type='button'
            onClick={() => onSelectResource?.(res.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius)] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border',
              isSelected
                ? 'bg-card text-foreground border-border/80 shadow-xs'
                : 'bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/40',
            )}
          >
            <span
              className={cn('w-2 h-2 rounded-full shrink-0', config.dotClass)}
            />
            <span>{res.name}</span>
          </button>
        );
      })}
    </div>
  );
}
