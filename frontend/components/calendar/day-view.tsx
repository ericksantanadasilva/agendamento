"use client";

import * as React from "react";
import { StudioResource, CalendarAppointment } from "@/types/calendar";
import { TimeColumn } from "./time-column";
import { ResourceColumn } from "./resource-column";
import { CurrentTimeIndicator } from "./current-time-indicator";
import { EventDetailsDialog } from "./event-details-dialog";
import { HOUR_HEIGHT, isSameDay } from "./utils";
import { cn } from "@/lib/utils";

export interface DayViewProps {
  resources: StudioResource[];
  appointments: CalendarAppointment[];
  selectedDate: Date;
}

export function DayView({
  resources,
  appointments,
  selectedDate,
}: DayViewProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<CalendarAppointment | null>(null);
  const [activeMobileResourceId, setActiveMobileResourceId] =
    React.useState<string>("all");

  const isToday = React.useMemo(() => {
    return isSameDay(selectedDate, new Date());
  }, [selectedDate]);

  // Auto-scroll inicial suave para as 08:00 (ou horário atual se for hoje)
  React.useEffect(() => {
    if (!scrollContainerRef.current) return;

    let targetHour = 8; // padrão: 08:00
    if (isToday) {
      const nowHour = new Date().getHours();
      // Foca 1 hora antes do horário atual para contexto, mínimo 0
      targetHour = Math.max(nowHour - 1, 0);
    }

    const scrollTargetY = targetHour * HOUR_HEIGHT;
    scrollContainerRef.current.scrollTo({
      top: scrollTargetY,
      behavior: "smooth",
    });
  }, [isToday]);

  // Recursos filtrados no mobile quando uma aba específica é selecionada
  const visibleResources = React.useMemo(() => {
    if (activeMobileResourceId === "all") return resources;
    return resources.filter((r) => r.id === activeMobileResourceId);
  }, [resources, activeMobileResourceId]);

  const selectedResource = React.useMemo(() => {
    if (!selectedAppointment) return undefined;
    return resources.find((r) => r.id === selectedAppointment.resourceId);
  }, [resources, selectedAppointment]);

  return (
    <div className="flex flex-col flex-1 min-w-0 border border-border rounded-[var(--radius)] bg-card overflow-hidden">
      {/* Mobile Resource Selector Tabs (visível somente em telas < md) */}
      <div className="flex md:hidden items-center gap-1.5 p-2 border-b border-border bg-muted/40 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveMobileResourceId("all")}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
            activeMobileResourceId === "all"
              ? "bg-card text-foreground border border-border shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Todos os Estúdios
        </button>
        {resources.map((res) => (
          <button
            key={res.id}
            type="button"
            onClick={() => setActiveMobileResourceId(res.id)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
              activeMobileResourceId === res.id
                ? "bg-card text-foreground border border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {res.name}
          </button>
        ))}
      </div>

      {/* Grade com Scroll Vertical (24h) e Scroll Horizontal (Recursos) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-16rem)] relative"
      >
        <div className="flex min-w-full w-max relative">
          {/* Coluna Lateral de Tempo (Sticky à esquerda) */}
          <TimeColumn />

          {/* Colunas de Recursos / Estúdios */}
          <div className="flex flex-1 relative">
            {/* Indicador de Horário Real em Tempo Real (exibido no dia corrente) */}
            {isToday && <CurrentTimeIndicator showLabel={true} />}

            {visibleResources.map((resource) => (
              <ResourceColumn
                key={resource.id}
                resource={resource}
                appointments={appointments}
                onEventClick={(apt) => setSelectedAppointment(apt)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes ao Clicar no Agendamento */}
      <EventDetailsDialog
        appointment={selectedAppointment}
        resourceName={selectedResource?.name}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
}
