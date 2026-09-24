"use client";

import * as React from "react";
import {
  CalendarHeader,
  CalendarToolbar,
  DayView,
} from "@/components/calendar";
import { MOCK_RESOURCES, MOCK_APPOINTMENTS } from "@/lib/mock-calendar-data";
import { CalendarViewMode } from "@/types/calendar";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>("day");
  const [newAppointmentNotice, setNewAppointmentNotice] = React.useState(false);

  // Navegação: Dia anterior
  const handlePreviousDay = React.useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 1);
      return next;
    });
  }, []);

  // Navegação: Próximo dia
  const handleNextDay = React.useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 1);
      return next;
    });
  }, []);

  // Navegação: Voltar para Hoje
  const handleToday = React.useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const handleNewAppointment = React.useCallback(() => {
    setNewAppointmentNotice(true);
    setTimeout(() => {
      setNewAppointmentNotice(false);
    }, 4000);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-w-0 space-y-4">
      {/* Notificação temporária sutil ao clicar em Novo Agendamento */}
      {newAppointmentNotice && (
        <div className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-muted border border-border text-xs text-foreground animate-in fade-in slide-in-from-top-1 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-medium">Fluxo de Criação:</span>
            <span className="text-muted-foreground">
              O formulário completo de agendamento será conectado na próxima fase de produto.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNewAppointmentNotice(false)}
            className="text-3xs text-muted-foreground hover:text-foreground underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header do Calendário */}
      <CalendarHeader
        selectedDate={selectedDate}
        onNewAppointment={handleNewAppointment}
      />

      {/* Toolbar com navegação temporal e seletor */}
      <CalendarToolbar
        selectedDate={selectedDate}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Área Principal: Calendar Day View (24 Horas) */}
      <div className="flex-1 flex flex-col min-h-0 pt-1">
        <DayView
          resources={MOCK_RESOURCES}
          appointments={MOCK_APPOINTMENTS}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}
