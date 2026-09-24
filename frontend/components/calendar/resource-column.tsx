"use client";

import * as React from "react";
import { StudioResource, CalendarAppointment } from "@/types/calendar";
import { CalendarEvent } from "./calendar-event";
import {
  HOUR_HEIGHT,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
  getCalendarHeight,
} from "./utils";
import { cn } from "@/lib/utils";

export interface ResourceColumnProps {
  resource: StudioResource;
  isLast?: boolean;
  startHour?: number;
  endHour?: number;
  appointments: CalendarAppointment[];
  onEventClick?: (appointment: CalendarAppointment) => void;
  className?: string;
}

export function ResourceColumn({
  resource,
  isLast = false,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  appointments,
  onEventClick,
  className,
}: ResourceColumnProps) {
  // Filtra agendamentos deste recurso específico
  const resourceAppointments = React.useMemo(() => {
    return appointments.filter((apt) => apt.resourceId === resource.id);
  }, [appointments, resource.id]);

  const totalHours = Math.max(endHour - startHour, 1);
  const columnHeight = getCalendarHeight(startHour, endHour);

  return (
    <div
      className={cn(
        "flex-1 min-w-56 sm:min-w-64 lg:min-w-72 relative select-none",
        !isLast && "border-r border-border/20",
        className,
      )}
      style={{ height: `${columnHeight}px` }}
    >
      {/* Linhas Horárias sutis como guias de leitura temporal (não linhas duras de planilha) */}
      {Array.from({ length: totalHours }).map((_, index) => (
        <div
          key={index}
          style={{
            top: `${index * HOUR_HEIGHT}px`,
            height: `${HOUR_HEIGHT}px`,
          }}
          className="absolute inset-x-0 border-b border-border/15 pointer-events-none"
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
