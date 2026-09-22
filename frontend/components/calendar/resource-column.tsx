"use client";

import * as React from "react";
import { StudioResource, CalendarAppointment } from "@/types/calendar";
import { CalendarEvent } from "./calendar-event";
import { HOUR_HEIGHT, TOTAL_HOURS, TOTAL_DAY_HEIGHT } from "./utils";
import { cn } from "@/lib/utils";

export interface ResourceColumnProps {
  resource: StudioResource;
  appointments: CalendarAppointment[];
  onEventClick?: (appointment: CalendarAppointment) => void;
  className?: string;
}

export function ResourceColumn({
  resource,
  appointments,
  onEventClick,
  className,
}: ResourceColumnProps) {
  // Filtra agendamentos deste recurso específico
  const resourceAppointments = React.useMemo(() => {
    return appointments.filter((apt) => apt.resourceId === resource.id);
  }, [appointments, resource.id]);

  return (
    <div
      className={cn(
        "flex-1 min-w-[220px] sm:min-w-[260px] lg:min-w-[280px] border-r border-border flex flex-col relative select-none",
        className,
      )}
    >
      {/* Cabeçalho do Recurso (Sticky no topo da grade) */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-3.5 py-2.5 flex flex-col justify-center h-14">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate">
            {resource.name}
          </h3>
          {resource.capacity && (
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50 shrink-0">
              {resource.capacity}p
            </span>
          )}
        </div>
        {resource.subtitle && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {resource.subtitle}
          </p>
        )}
      </div>

      {/* Grade de 24 Horas com Linhas Horárias e Agendamentos */}
      <div
        className="relative w-full"
        style={{ height: `${TOTAL_DAY_HEIGHT}px` }}
      >
        {/* Linhas Horárias de Apoio de Fundo */}
        {Array.from({ length: TOTAL_HOURS }).map((_, hourIndex) => (
          <div
            key={hourIndex}
            style={{
              top: `${hourIndex * HOUR_HEIGHT}px`,
              height: `${HOUR_HEIGHT}px`,
            }}
            className="absolute inset-x-0 border-b border-border/40 pointer-events-none hover:bg-muted/10 transition-colors"
          >
            {/* Linha pontilhada de meia hora (30m) */}
            <div className="w-full h-1/2 border-b border-border/15 pointer-events-none" />
          </div>
        ))}

        {/* Agendamentos Renderizados */}
        {resourceAppointments.map((apt) => (
          <CalendarEvent
            key={apt.id}
            appointment={apt}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
