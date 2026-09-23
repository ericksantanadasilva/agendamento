"use client";

import * as React from "react";
import { StudioResource, CalendarAppointment } from "@/types/calendar";
import { TimeColumn } from "./time-column";
import { ResourceColumn } from "./resource-column";
import { CurrentTimeIndicator } from "./current-time-indicator";
import { EventDetailsDialog } from "./event-details-dialog";
import {
  HOUR_HEIGHT,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
  isSameDay,
} from "./utils";
import { cn } from "@/lib/utils";

export interface DayViewProps {
  resources: StudioResource[];
  appointments: CalendarAppointment[];
  selectedDate: Date;
  calendarStartHour?: number;
  calendarEndHour?: number;
  initialFocusHour?: number;
}

export function DayView({
  resources,
  appointments,
  selectedDate,
  calendarStartHour = DEFAULT_START_HOUR,
  calendarEndHour = DEFAULT_END_HOUR,
  initialFocusHour,
}: DayViewProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<CalendarAppointment | null>(null);
  const [activeMobileResourceId, setActiveMobileResourceId] =
    React.useState<string>("all");

  const isToday = React.useMemo(() => {
    return isSameDay(selectedDate, new Date());
  }, [selectedDate]);

  // Viewport inicial: somente rola se initialFocusHour for explicitamente fornecido
  React.useEffect(() => {
    if (!scrollContainerRef.current || initialFocusHour === undefined) return;

    const offsetHours = Math.max(initialFocusHour - calendarStartHour, 0);
    const scrollTargetY = offsetHours * HOUR_HEIGHT;
    scrollContainerRef.current.scrollTo({
      top: scrollTargetY,
      behavior: "smooth",
    });
  }, [initialFocusHour, calendarStartHour]);

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
    <div className="flex flex-col flex-1 min-w-0 border border-border/50 rounded-[var(--radius)] bg-card overflow-hidden">
      {/* Mobile Resource Selector Tabs (visível somente em telas < md) */}
      <div className="flex md:hidden items-center gap-1.5 p-2 border-b border-border/50 bg-muted/20 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveMobileResourceId("all")}
          className={cn(
            "px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
            activeMobileResourceId === "all"
              ? "bg-card text-foreground border border-border/70 shadow-xs"
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
                ? "bg-card text-foreground border border-border/70 shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {res.name}
          </button>
        ))}
      </div>

      {/* Grade com Scroll Vertical e Scroll Horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-16rem)] relative"
      >
        <div className="flex flex-col min-w-full w-max relative">
          {/* Cabeçalho Unificado e Contínuo dos Estúdios (Sticky Top) */}
          <div className="sticky top-0 z-30 flex bg-card border-b border-border/50">
            {/* Célula GMT-3 (Sticky Top + Sticky Left na interseção) */}
            <div className="sticky left-0 z-40 bg-card w-12 sm:w-16 shrink-0 border-r border-border/30 h-14 flex items-center justify-center">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
                GMT-3
              </span>
            </div>

            {/* Barra Contínua dos Estúdios (sem divisórias verticais duras) */}
            <div className="flex flex-1">
              {visibleResources.map((resource, index) => (
                <div
                  key={resource.id}
                  className="flex-1 min-w-[220px] sm:min-w-[260px] lg:min-w-[280px] px-4 py-2.5 flex flex-col justify-center h-14"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-medium text-muted-foreground/45 shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground truncate">
                        {resource.name}
                      </h3>
                    </div>
                    {resource.type && (
                      <span className="font-mono text-[9px] text-muted-foreground/45 tracking-tight shrink-0 hidden sm:inline">
                        {resource.type}
                      </span>
                    )}
                  </div>
                  {resource.subtitle && (
                    <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5 pl-6">
                      {resource.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Corpo da Grade Temporal */}
          <div className="flex flex-1 relative">
            {/* Coluna Lateral de Horas (Sticky Left) */}
            <TimeColumn
              startHour={calendarStartHour}
              endHour={calendarEndHour}
            />

            {/* Colunas de Recursos / Estúdios */}
            <div className="flex flex-1 relative">
              {/* Indicador de Horário Real em Tempo Real (exibido no dia corrente) */}
              {isToday && (
                <CurrentTimeIndicator
                  showLabel={true}
                  startHour={calendarStartHour}
                  endHour={calendarEndHour}
                />
              )}

              {visibleResources.map((resource, index) => (
                <ResourceColumn
                  key={resource.id}
                  resource={resource}
                  isLast={index === visibleResources.length - 1}
                  startHour={calendarStartHour}
                  endHour={calendarEndHour}
                  appointments={appointments}
                  onEventClick={(apt) => setSelectedAppointment(apt)}
                />
              ))}
            </div>
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
