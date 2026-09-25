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
import { MOCK_RESOURCES, MOCK_APPOINTMENTS } from "@/lib/mock-calendar-data";
import { CalendarViewMode, CalendarAppointment } from "@/types/calendar";
import { CheckCircle2 } from "lucide-react";

export default function CalendarPage() {
  const [mounted, setMounted] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>("day");
  const [appointments, setAppointments] = React.useState<CalendarAppointment[]>(MOCK_APPOINTMENTS);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<CalendarAppointment | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleDeleteAppointment = React.useCallback((appointmentId: string) => {
    setAppointments((prev) => {
      const target = prev.find((a) => a.id === appointmentId);
      const filtered = prev.filter((a) => a.id !== appointmentId);
      setSuccessToast(`Agendamento de "${target?.clientName || "Cliente"}" excluído.`);
      return filtered;
    });

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  }, []);

  const handleSaveAppointment = React.useCallback(
    (appointmentData: Omit<CalendarAppointment, "id">, id?: string) => {
      if (id) {
        // Atualização / Edição de agendamento existente
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...appointmentData, id } : apt)),
        );
        setSuccessToast(`Agendamento de "${appointmentData.clientName}" atualizado com sucesso!`);
      } else {
        // Criação de novo agendamento
        const newAppointment: CalendarAppointment = {
          ...appointmentData,
          id: `apt-${Date.now()}`,
        };

        setAppointments((prev) => [newAppointment, ...prev]);
        setSuccessToast(
          `Agendamento de "${appointmentData.clientName}" reservado no ${
            MOCK_RESOURCES.find((r) => r.id === appointmentData.resourceId)?.name || "Estúdio"
          }!`,
        );
      }

      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
    },
    [],
  );

  if (!mounted) {
    return (
      <div className="flex flex-col flex-1 min-w-0 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-muted/40 rounded-[var(--radius)]" />
        <div className="h-8 w-64 bg-muted/30 rounded-[var(--radius)]" />
        <div className="flex-1 bg-card/40 rounded-[var(--radius)] border border-border/30 min-h-[500px]" />
      </div>
    );
  }

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
            resources={MOCK_RESOURCES}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onSelectDay={handleSelectDayFromMonth}
            onCreateAppointment={handleCreateAppointmentAtDate}
          />
        ) : viewMode === "week" ? (
          <WeekView
            resources={MOCK_RESOURCES}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        ) : (
          <DayView
            resources={MOCK_RESOURCES}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
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
        resources={MOCK_RESOURCES}
        selectedDate={selectedDate}
        initialData={editingAppointment}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
      />
    </div>
  );
}
