'use client';

import * as React from 'react';
import { StudioResource, CalendarAppointment } from '@/types/calendar';
import { WeekCalendarEvent } from './week-calendar-event';
import { CurrentTimeIndicator } from './current-time-indicator';
import {
  HOUR_HEIGHT,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
  getCalendarHeight,
  getSlotTimeFromClick,
  toISODateString,
  computeOverlappingLayout,
} from './utils';
import { cn } from '@/lib/utils';

export interface WeekDayColumnProps {
  date: Date;
  isToday?: boolean;
  isLast?: boolean;
  startHour?: number;
  endHour?: number;
  resources: StudioResource[];
  appointments: CalendarAppointment[];
  onEventClick?: (appointment: CalendarAppointment) => void;
  onSlotClick?: (date: Date, time: string) => void;
  className?: string;
}

export function WeekDayColumn({
  date,
  isToday = false,
  isLast = false,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  resources,
  appointments,
  onEventClick,
  onSlotClick,
  className,
}: WeekDayColumnProps) {
  const dateStr = React.useMemo(() => toISODateString(date), [date]);

  // Filtra agendamentos pertencentes a este dia específico
  const dayAppointments = React.useMemo(() => {
    return appointments.filter((apt) => apt.date === dateStr);
  }, [appointments, dateStr]);

  const resourceIds = React.useMemo(
    () => resources.map((r) => r.id),
    [resources],
  );

  // Computa layout e larguras de sobreposição garantindo ordem E1 -> E2 -> E3
  const layoutPositions = React.useMemo(() => {
    return computeOverlappingLayout(dayAppointments, resourceIds);
  }, [dayAppointments, resourceIds]);

  const totalHours = Math.max(endHour - startHour, 1);
  const columnHeight = getCalendarHeight(startHour, endHour);

  function handleSlotClick(event: React.MouseEvent<HTMLDivElement>) {
    // Cliques em reservas têm o próprio tratamento; aqui só vale a área vazia.
    if (!onSlotClick || event.target !== event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();
    onSlotClick(date, getSlotTimeFromClick(event.clientY, rect.top, startHour));
  }

  return (
    <div
      className={cn(
        'flex-1 min-w-36 sm:min-w-40 md:min-w-44 relative select-none',
        isToday ? 'bg-muted/10' : 'bg-card',
        !isLast && 'border-r border-border/20',
        onSlotClick && 'cursor-pointer',
        className,
      )}
      style={{ height: `${columnHeight}px` }}
      onClick={handleSlotClick}
    >
      {/* Linhas Horárias Guia (não interceptam o clique da coluna) */}
      {Array.from({ length: totalHours }).map((_, index) => (
        <div
          key={index}
          style={{
            top: `${index * HOUR_HEIGHT}px`,
            height: `${HOUR_HEIGHT}px`,
          }}
          className='absolute inset-x-0 border-b border-border/15 pointer-events-none'
        />
      ))}

      {/* Indicador de Horário Real (exibido na coluna de hoje) */}
      {isToday && (
        <CurrentTimeIndicator
          showLabel={false}
          startHour={startHour}
          endHour={endHour}
        />
      )}

      {/* Agendamentos do dia renderizados com cores por estúdio */}
      {dayAppointments.map((apt) => (
        <WeekCalendarEvent
          key={apt.id}
          appointment={apt}
          resources={resources}
          startHour={startHour}
          layoutPosition={layoutPositions.get(apt.id)}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
}
