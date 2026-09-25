"use client";

import * as React from "react";
import { StudioResource, CalendarAppointment } from "@/types/calendar";
import { StudioFilter } from "./studio-filter";
import { MonthCalendarCell } from "./month-calendar-cell";
import { EventDetailsDialog } from "./event-details-dialog";
import {
  getMonthCalendarDays,
  formatWeekDayShort,
} from "./utils";
import { cn } from "@/lib/utils";

export interface MonthViewProps {
  resources: StudioResource[];
  appointments: CalendarAppointment[];
  selectedDate: Date;
  onEditAppointment?: (appointment: CalendarAppointment) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
  onSelectDay?: (date: Date) => void;
  onCreateAppointment?: (date: Date) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthView({
  resources,
  appointments,
  selectedDate,
  onEditAppointment,
  onDeleteAppointment,
  onSelectDay,
  onCreateAppointment,
}: MonthViewProps) {
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<CalendarAppointment | null>(null);
  const [selectedResourceId, setSelectedResourceId] =
    React.useState<string>("all");

  // Filtra agendamentos caso um estúdio específico seja selecionado no filtro
  const filteredAppointments = React.useMemo(() => {
    if (selectedResourceId === "all") return appointments;
    return appointments.filter((apt) => apt.resourceId === selectedResourceId);
  }, [appointments, selectedResourceId]);

  // Dias da grade do mês (completa semanas de Segunda a Domingo)
  const monthDays = React.useMemo(() => {
    return getMonthCalendarDays(selectedDate);
  }, [selectedDate]);

  const selectedResource = React.useMemo(() => {
    if (!selectedAppointment) return undefined;
    return resources.find((r) => r.id === selectedAppointment.resourceId);
  }, [resources, selectedAppointment]);

  return (
    <div className="flex flex-col flex-1 min-w-0 border border-border/50 rounded-[var(--radius)] bg-card overflow-hidden">
      {/* Barra Superior: Filtro Rápido de Estúdios */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20">
        <StudioFilter
          resources={resources}
          selectedResourceId={selectedResourceId}
          onSelectResource={setSelectedResourceId}
        />
      </div>

      {/* Grade Mensal Responsiva */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[700px] w-full flex flex-col">
          {/* Cabeçalho dos Dias da Semana (SEG a DOM) */}
          <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
            {WEEKDAYS.map((dayName) => (
              <div
                key={dayName}
                className="py-2.5 text-center text-3xs font-mono uppercase tracking-wider text-muted-foreground/75 border-r border-border/20 last:border-r-0 select-none"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Células dos Dias do Mês */}
          <div className="grid grid-cols-7 border-l border-border/20 flex-1">
            {monthDays.map((dayInfo) => (
              <MonthCalendarCell
                key={dayInfo.dateStr}
                dayInfo={dayInfo}
                appointments={filteredAppointments}
                resources={resources}
                onEventClick={(apt) => setSelectedAppointment(apt)}
                onDayClick={onSelectDay}
                onCreateAppointment={onCreateAppointment}
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
        onEdit={(apt) => {
          setSelectedAppointment(null);
          onEditAppointment?.(apt);
        }}
        onDelete={(id) => {
          setSelectedAppointment(null);
          onDeleteAppointment?.(id);
        }}
      />
    </div>
  );
}
