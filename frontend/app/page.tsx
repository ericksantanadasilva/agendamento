"use client";

import * as React from "react";
import {
  CalendarHeader,
  CalendarToolbar,
  DayView,
  WeekView,
  MonthView,
  NewAppointmentDialog,
} from "@/components/calendar";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { CalendarViewMode, CalendarAppointment } from "@/types/calendar";
import { CheckCircle2 } from "lucide-react";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>("day");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<CalendarAppointment | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const {
    resources,
    appointments,
    error,
  } = useCalendarData(selectedDate, viewMode);


  // Navegação: Período anterior (Dia, Semana ou Mês)
  const handlePreviousPeriod = React.useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(prev.getMonth() - 1);
      } else if (viewMode === "week") {
        next.setDate(prev.getDate() - 7);
      } else {
        next.setDate(prev.getDate() - 1);
      }
      return next;
    });
  }, [viewMode]);

  // Navegação: Próximo período (Dia, Semana ou Mês)
  const handleNextPeriod = React.useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "month") {
        next.setMonth(prev.getMonth() + 1);
      } else if (viewMode === "week") {
        next.setDate(prev.getDate() + 7);
      } else {
        next.setDate(prev.getDate() + 1);
      }
      return next;
    });
  }, [viewMode]);

  // Navegação: Voltar para Hoje
  const handleToday = React.useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const handleOpenNewAppointment = React.useCallback(() => {
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
  }, []);

  const handleCreateAppointmentAtDate = React.useCallback((date: Date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
  }, []);

  const handleSelectDayFromMonth = React.useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMode("day");
  }, []);

  const handleEditAppointment = React.useCallback((appointment: CalendarAppointment) => {
    setEditingAppointment(appointment);
    setIsNewAppointmentOpen(true);
  }, []);

  const showNotConnectedToast = React.useCallback(() => {
    setSuccessToast('Criar, editar e excluir ainda não estão ligados ao servidor.');
    setTimeout(() => setSuccessToast(null), 4000)
  }, [])

  return (
    <div className="flex flex-col flex-1 min-w-0 space-y-4">
      {/* Toast sutil de confirmação de agendamento criado/editado/excluído */}
      {successToast && (
        <div className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-surface-elevated border border-primary/40 text-xs text-foreground animate-in fade-in slide-in-from-top-1 select-none shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium text-foreground">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-3xs text-muted-foreground hover:text-foreground underline cursor-pointer ml-3"
          >
            Fechar
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      {/* Header do Calendário */}
      <CalendarHeader
        selectedDate={selectedDate}
        viewMode={viewMode}
        onNewAppointment={handleOpenNewAppointment}
      />

      {/* Toolbar com navegação temporal e seletor */}
      <CalendarToolbar
        selectedDate={selectedDate}
        onPreviousDay={handlePreviousPeriod}
        onNextDay={handleNextPeriod}
        onToday={handleToday}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Área Principal: Calendar Day View, Week View ou Month View */}
      <div className="flex-1 flex flex-col min-h-0 pt-1">
        {viewMode === "month" ? (
          <MonthView
            resources={resources}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={showNotConnectedToast}
            onSelectDay={handleSelectDayFromMonth}
            onCreateAppointment={handleCreateAppointmentAtDate}
          />
        ) : viewMode === "week" ? (
          <WeekView
            resources={resources}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={showNotConnectedToast}
          />
        ) : (
          <DayView
            resources={resources}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={showNotConnectedToast}
          />
        )}
      </div>

      {/* Modal de Criação / Edição de Agendamento */}
      <NewAppointmentDialog
        isOpen={isNewAppointmentOpen}
        onClose={() => {
          setIsNewAppointmentOpen(false);
          setEditingAppointment(null);
        }}
        resources={resources}
        selectedDate={selectedDate}
        initialData={editingAppointment}
        onSave={showNotConnectedToast}
        onDelete={showNotConnectedToast}
      />
    </div>
  );
}
