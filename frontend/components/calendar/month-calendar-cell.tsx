'use client';

import * as React from 'react';
import { CalendarAppointment, StudioResource } from '@/types/calendar';
import { MonthDayInfo } from './utils';
import { getStudioConfig } from './studio-config';
import { cn } from '@/lib/utils';

export interface MonthCalendarCellProps {
  dayInfo: MonthDayInfo;
  appointments: CalendarAppointment[];
  resources: StudioResource[];
  onEventClick?: (appointment: CalendarAppointment) => void;
  onDayClick?: (date: Date) => void;
  onCreateAppointment?: (date: Date) => void;
  className?: string;
}

const MAX_VISIBLE_EVENTS = 3;

export function MonthCalendarCell({
  dayInfo,
  appointments,
  resources,
  onEventClick,
  onDayClick,
  onCreateAppointment,
  className,
}: MonthCalendarCellProps) {
  // Ordena por horário inicial
  const dayAppointments = React.useMemo(() => {
    return appointments
      .filter((apt) => apt.date === dayInfo.dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, dayInfo.dateStr]);

  const visibleAppointments = dayAppointments.slice(0, MAX_VISIBLE_EVENTS);
  const remainingCount = dayAppointments.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      onClick={() => onCreateAppointment?.(dayInfo.date)}
      className={cn(
        'min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col border-b border-r border-border/20 transition-colors select-none cursor-pointer group',
        dayInfo.isCurrentMonth
          ? 'bg-card hover:bg-muted/15'
          : 'bg-muted/10 opacity-40 hover:opacity-70',
        dayInfo.isToday && 'bg-muted/15',
        className,
      )}
      title={`Clique no dia ${dayInfo.dayNumber} para criar um novo agendamento`}
    >
      {/* Cabeçalho da Célula: Número do Dia */}
      <div className='flex items-center justify-between mb-1.5'>
        <span />
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onDayClick?.(dayInfo.date);
          }}
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer',
            dayInfo.isToday
              ? 'bg-primary text-primary-foreground font-bold shadow-xs'
              : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/60',
          )}
          title={`Ver detalhes do dia ${dayInfo.dateStr}`}
        >
          {dayInfo.dayNumber}
        </button>
      </div>

      {/* Lista de Agendamentos com Identificação Explícita do Estúdio */}
      <div className='flex flex-col gap-1 flex-1 min-w-0'>
        {visibleAppointments.map((apt) => {
          const studioConfig = getStudioConfig(apt.resourceId, resources);
          const isBlocked = apt.status === 'BLOCKED';

          return (
            <div
              key={apt.id}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(apt);
              }}
              className={cn(
                'flex items-center gap-1.5 px-1.5 py-0.5 rounded-xs border-l-[3px] transition-colors cursor-pointer truncate',
                studioConfig.borderClass,
                isBlocked
                  ? 'bg-muted/40 text-muted-foreground/80'
                  : 'bg-surface-elevated hover:bg-surface-elevated-hover text-foreground',
                'border-t border-r border-b border-border/15',
              )}
              role='button'
              tabIndex={0}
              title={`${studioConfig.name} · ${apt.startTime} - ${apt.clientName} (${apt.serviceName})`}
            >
              {/* Tag com cor e código do Estúdio (E1, E2, E3) */}
              <span
                className={cn(
                  'font-mono text-4xs font-semibold px-1 py-0.2 rounded-xs border shrink-0 leading-none',
                  studioConfig.badgeClass,
                )}
                title={studioConfig.name}
              >
                {studioConfig.shortName}
              </span>

              {/* Horário */}
              <span className='font-mono text-4xs text-muted-foreground/75 shrink-0'>
                {apt.startTime}
              </span>

              {/* Nome do Cliente */}
              <span className='text-3xs font-medium truncate leading-tight'>
                {apt.clientName}
              </span>
            </div>
          );
        })}

        {/* Indicador de Mais Agendamentos (+N mais) */}
        {remainingCount > 0 && (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onDayClick?.(dayInfo.date);
            }}
            className='text-4xs text-muted-foreground/75 hover:text-primary transition-colors text-left px-1 mt-auto pt-0.5 cursor-pointer font-medium'
          >
            +{remainingCount} mais...
          </button>
        )}
      </div>
    </div>
  );
}
