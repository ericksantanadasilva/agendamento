'use client';

import * as React from 'react';
import { CalendarViewMode } from '@/types/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  isSameDay,
  formatWeekRange,
  getWeekDates,
  formatMonthRange,
} from './utils';
import { cn } from '@/lib/utils';

export interface CalendarToolbarProps {
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
}

export function CalendarToolbar({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
  viewMode = 'day',
  onViewModeChange,
}: CalendarToolbarProps) {
  const isCurrentTimeSelected = React.useMemo(() => {
    const today = new Date();
    if (viewMode === 'month') {
      return (
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear()
      );
    }
    if (viewMode === 'week') {
      const week = getWeekDates(selectedDate);
      return week.some((d) => isSameDay(d, today));
    }
    return isSameDay(selectedDate, today);
  }, [selectedDate, viewMode]);

  const dateLabel = React.useMemo(() => {
    if (viewMode === 'month') {
      return formatMonthRange(selectedDate);
    }
    if (viewMode === 'week') {
      return formatWeekRange(selectedDate);
    }
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(selectedDate);
  }, [selectedDate, viewMode]);

  const previousTitle = React.useMemo(() => {
    if (viewMode === 'month') return 'Mês anterior';
    if (viewMode === 'week') return 'Semana anterior';
    return 'Dia anterior';
  }, [viewMode]);

  const nextTitle = React.useMemo(() => {
    if (viewMode === 'month') return 'Próximo mês';
    if (viewMode === 'week') return 'Próxima semana';
    return 'Próximo dia';
  }, [viewMode]);

  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 text-xs select-none'>
      {/* Controles de Navegação Temporal (< Hoje >) */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={onPreviousDay}
            title={previousTitle}
            className='p-1 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>

          <button
            type='button'
            onClick={onToday}
            className={cn(
              'px-2.5 py-1 text-xs rounded-[var(--radius)] transition-colors cursor-pointer border',
              isCurrentTimeSelected
                ? 'bg-muted/90 text-foreground font-medium border-border/80'
                : 'bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/40',
            )}
          >
            Hoje
          </button>

          <button
            type='button'
            onClick={onNextDay}
            title={nextTitle}
            className='p-1 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>

        {/* Indicador de Data Reduzida / Rótulo de Apoio */}
        <div className='hidden sm:flex items-center gap-1.5 text-muted-foreground/70 font-mono text-2xs'>
          <CalendarIcon className='w-3.5 h-3.5 text-primary/80 shrink-0' />
          <span>{dateLabel}</span>
        </div>
      </div>

      {/* Seletor de Modo de Visualização (Dia, Semana, Mês) */}
      <div className='flex items-center gap-1 self-start sm:self-auto'>
        <button
          type='button'
          onClick={() => onViewModeChange?.('day')}
          className={cn(
            'px-2.5 py-1 text-xs rounded-[var(--radius)] transition-colors cursor-pointer',
            viewMode === 'day'
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30',
          )}
        >
          Dia
        </button>

        <button
          type='button'
          onClick={() => onViewModeChange?.('week')}
          className={cn(
            'px-2.5 py-1 text-xs rounded-[var(--radius)] transition-colors cursor-pointer',
            viewMode === 'week'
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30',
          )}
        >
          Semana
        </button>

        <button
          type='button'
          onClick={() => onViewModeChange?.('month')}
          className={cn(
            'px-2.5 py-1 text-xs rounded-[var(--radius)] transition-colors cursor-pointer',
            viewMode === 'month'
              ? 'bg-muted text-foreground font-medium'
              : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30',
          )}
        >
          Mês
        </button>
      </div>
    </div>
  );
}
