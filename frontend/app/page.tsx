'use client';

import * as React from 'react';
import {
  CalendarHeader,
  CalendarToolbar,
  DayView,
  WeekView,
  MonthView,
  NewAppointmentDialog,
  toISODateString,
} from '@/components/calendar';
import { useCalendarData } from '@/hooks/use-calendar-data';
import {
  AppointmentSlot,
  CalendarViewMode,
  CalendarAppointment,
} from '@/types/calendar';
import { apiClient } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { studioDateTimeToIso } from '@/lib/agenda';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    () => new Date(),
  );
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>('day');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] =
    React.useState<CalendarAppointment | null>(null);
  const [initialSlot, setInitialSlot] = React.useState<AppointmentSlot | null>(
    null,
  );

  const { resources, appointments, error, reload } = useCalendarData(
    selectedDate,
    viewMode,
  );

  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error, showToast]);

  // Navegação: Período anterior (Dia, Semana ou Mês)
  const handlePreviousPeriod = React.useCallback(() => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setMonth(prev.getMonth() - 1);
      } else if (viewMode === 'week') {
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
      if (viewMode === 'month') {
        next.setMonth(prev.getMonth() + 1);
      } else if (viewMode === 'week') {
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
    setInitialSlot(null);
  }, []);

  const handleCreateAppointmentAtDate = React.useCallback((date: Date) => {
    setSelectedDate(date);
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
    setInitialSlot(null);
  }, []);

  const handleCreateAppointmentAtSlot = React.useCallback(
    (date: Date, resourceId: string, time: string) => {
      const startsAt = studioDateTimeToIso(toISODateString(date), time);
      if (new Date(startsAt).getTime() <= Date.now()) {
        showToast('Esse horário já passou.', 'error');
        return;
      }
      setSelectedDate(date);
      setEditingAppointment(null);
      setInitialSlot({ resourceId, time });
      setIsNewAppointmentOpen(true);
    },
    [showToast],
  );

  const handleSelectDayFromMonth = React.useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  }, []);

  const handleEditAppointment = React.useCallback(
    (appointment: CalendarAppointment) => {
      setEditingAppointment(appointment);
      setIsNewAppointmentOpen(true);
      setInitialSlot(null);
    },
    [],
  );

  const handleCancelAppointment = React.useCallback(
    async (appointmentId: string) => {
      try {
        await apiClient(`/appointments/${appointmentId}/cancel`, {
          method: 'PATCH',
          body: JSON.stringify({}),
        });
        showToast('Reserva cancelada.');
        reload();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : 'Não foi possível cancelar.',
          'error',
        );
      }
    },
    [reload, showToast],
  );

  return (
    <div className='flex flex-col flex-1 min-w-0 space-y-4'>
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
      <div className='flex-1 flex flex-col min-h-0 pt-1'>
        {viewMode === 'month' ? (
          <MonthView
            resources={resources}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleCancelAppointment}
            onSelectDay={handleSelectDayFromMonth}
            onCreateAppointment={handleCreateAppointmentAtDate}
          />
        ) : viewMode === 'week' ? (
          <WeekView
            resources={resources}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleCancelAppointment}
          />
        ) : (
          <DayView
            resources={resources}
            appointments={appointments}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleCancelAppointment}
            onCreateAppointment={handleCreateAppointmentAtSlot}
          />
        )}
      </div>

      {/* Modal de Criação / Edição de Agendamento */}
      <NewAppointmentDialog
        isOpen={isNewAppointmentOpen}
        onClose={() => {
          setIsNewAppointmentOpen(false);
          setEditingAppointment(null);
          setInitialSlot(null);
        }}
        resources={resources}
        selectedDate={selectedDate}
        initialData={editingAppointment}
        onSaved={reload}
        initialSlot={initialSlot}
      />
    </div>
  );
}
