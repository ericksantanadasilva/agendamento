'use client';

import * as React from 'react';
import { StudioResource, CalendarAppointment } from '@/types/calendar';
import { CalendarEvent } from './calendar-event';
import {
  HOUR_HEIGHT,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
  getCalendarHeight,
  getSlotTimeFromClick,
  toISODateString,
} from './utils';
import { cn } from '@/lib/utils';

export interface ResourceColumnProps {
  resource: StudioResource;
  isLast?: boolean;
  startHour?: number;
  endHour?: number;
  appointments: CalendarAppointment[];
  date?: Date | string;
  onEventClick?: (appointment: CalendarAppointment) => void;
  onSlotClick?: (resourceId: string, time: string) => void;
  className?: string;
}

export function ResourceColumn({
  resource,
  isLast = false,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  appointments,
  date,
  onEventClick,
  onSlotClick,
  className,
}: ResourceColumnProps) {
  const dateStr = React.useMemo(() => {
    if (!date) return null;
    return typeof date === 'string' ? date : toISODateString(date);
  }, [date]);

  // Filtra agendamentos deste recurso específico (e data se informada)
  const resourceAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      const matchResource = apt.resourceId === resource.id;
      const matchDate = dateStr ? apt.date === dateStr : true;
      return matchResource && matchDate;
    });
  }, [appointments, resource.id, dateStr]);

  const totalHours = Math.max(endHour - startHour, 1);
  const columnHeight = getCalendarHeight(startHour, endHour);

  function handleSlotClick(event: React.MouseEvent<HTMLDivElement>) {
    // Cliques em reservas têm o próprio tratamento; aqui só vale área vazia.
    if (!onSlotClick || event.target !== event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();
    onSlotClick(
      resource.id,
      getSlotTimeFromClick(event.clientY, rect.top, startHour),
    );
  }

  return (
    <div
      className={cn(
        'flex-1 min-w-56 sm:min-w-64 lg:min-w-72 relative select-none',
        !isLast && 'border-r border-border/20',
        className,
      )}
      style={{ height: `${columnHeight}px` }}
      onClick={handleSlotClick}
    >
      {/* Linhas Horárias sutis como guias de leitura temporal (não linhas duras de planilha) */}
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

      {/* Agendamentos Renderizados */}
      {resourceAppointments.map((apt) => (
        <CalendarEvent
          key={apt.id}
          appointment={apt}
          startHour={startHour}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
}
