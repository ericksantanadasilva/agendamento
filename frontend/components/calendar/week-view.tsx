'use client';

import * as React from 'react';
import { StudioResource, CalendarAppointment } from '@/types/calendar';
import { TimeColumn } from './time-column';
import { WeekDayColumn } from './week-day-column';
import { StudioFilter } from './studio-filter';
import { EventDetailsDialog } from './event-details-dialog';
import {
  HOUR_HEIGHT,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
  getWeekDates,
  isSameDay,
  formatWeekDayShort,
} from './utils';
import { cn } from '@/lib/utils';

export interface WeekViewProps {
  resources: StudioResource[];
  appointments: CalendarAppointment[];
  selectedDate: Date;
  calendarStartHour?: number;
  calendarEndHour?: number;
  initialFocusHour?: number;
  onEditAppointment?: (appointment: CalendarAppointment) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
  onCreateAppointment?: (
    date: Date,
    resourceId: string | undefined,
    time: string,
  ) => void;
}

export function WeekView({
  resources,
  appointments,
  selectedDate,
  calendarStartHour = DEFAULT_START_HOUR,
  calendarEndHour = DEFAULT_END_HOUR,
  initialFocusHour = 8, // Por padrão, foca o início do expediente às 08:00
  onEditAppointment,
  onDeleteAppointment,
  onCreateAppointment,
}: WeekViewProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedAppointment, setSelectedAppointment] =
    React.useState<CalendarAppointment | null>(null);
  const [selectedResourceId, setSelectedResourceId] =
    React.useState<string>('all');

  // Filtra agendamentos caso um estúdio específico seja selecionado no filtro
  const filteredAppointments = React.useMemo(() => {
    if (selectedResourceId === 'all') return appointments;
    return appointments.filter((apt) => apt.resourceId === selectedResourceId);
  }, [appointments, selectedResourceId]);

  // Calcula os 7 dias da semana (Segunda a Domingo)
  const weekDays = React.useMemo(() => {
    return getWeekDates(selectedDate);
  }, [selectedDate]);

  const today = React.useMemo(() => new Date(), []);

  // Rolagem suave inicial para o horário de foco (ex: 08:00)
  React.useEffect(() => {
    if (!scrollContainerRef.current || initialFocusHour === undefined) return;

    const offsetHours = Math.max(initialFocusHour - calendarStartHour, 0);
    const scrollTargetY = offsetHours * HOUR_HEIGHT;
    scrollContainerRef.current.scrollTo({
      top: scrollTargetY,
      behavior: 'smooth',
    });
  }, [initialFocusHour, calendarStartHour]);

  const selectedResource = React.useMemo(() => {
    if (!selectedAppointment) return undefined;
    return resources.find((r) => r.id === selectedAppointment.resourceId);
  }, [resources, selectedAppointment]);

  return (
    <div className='flex flex-col flex-1 min-w-0 border border-border/50 rounded-[var(--radius)] bg-card overflow-hidden'>
      {/* Barra Superior: Filtro Rápido de Estúdios (Todos ou estúdio individual) */}
      <div className='flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/20'>
        <StudioFilter
          resources={resources}
          selectedResourceId={selectedResourceId}
          onSelectResource={setSelectedResourceId}
        />
      </div>

      {/* Grade com Scroll Vertical e Scroll Horizontal */}
      <div
        ref={scrollContainerRef}
        className='flex-1 overflow-x-auto overflow-y-auto max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-16rem)] relative'
      >
        <div className='flex flex-col min-w-full w-full relative'>
          {/* Cabeçalho Sticky dos Dias da Semana */}
          <div className='sticky top-0 z-30 flex bg-card border-b border-border/50 w-full min-w-full'>
            {/* Célula GMT-3 (Sticky Top + Sticky Left) */}
            <div className='sticky left-0 z-40 bg-card w-12 sm:w-16 shrink-0 border-r border-border/30 h-14 flex items-center justify-center'>
              <span className='font-mono text-4xs uppercase tracking-wider text-muted-foreground/50'>
                GMT-3
              </span>
            </div>

            {/* Cabeçalho dos 7 Dias da Semana (Largura proporcional às colunas) */}
            <div className='flex flex-1 w-full min-w-0'>
              {weekDays.map((dayDate, index) => {
                const isCurrentDay = isSameDay(dayDate, today);
                const isSelected = isSameDay(dayDate, selectedDate);
                const dayName = formatWeekDayShort(dayDate);
                const dayNumber = dayDate.getDate();

                return (
                  <div
                    key={dayDate.toISOString()}
                    className={cn(
                      'flex-1 min-w-36 sm:min-w-40 md:min-w-44 px-2 sm:px-3 py-2 flex flex-col items-center justify-center h-14 select-none',
                      !isCurrentDay &&
                        index < weekDays.length - 1 &&
                        'border-r border-border/15',
                      isCurrentDay && 'bg-muted/15 border-r border-border/20',
                    )}
                  >
                    <span className='font-mono text-4xs uppercase tracking-wider text-muted-foreground/70'>
                      {dayName}
                    </span>
                    <div
                      className={cn(
                        'mt-0.5 w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full transition-colors',
                        isCurrentDay
                          ? 'bg-primary text-primary-foreground font-bold'
                          : isSelected
                            ? 'bg-muted text-foreground'
                            : 'text-foreground',
                      )}
                    >
                      {dayNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corpo da Grade Temporal */}
          <div className='flex flex-1 w-full relative'>
            {/* Coluna Lateral de Horas (Sticky Left) */}
            <TimeColumn
              startHour={calendarStartHour}
              endHour={calendarEndHour}
            />

            {/* 7 Colunas Diárias */}
            <div className='flex flex-1 w-full min-w-0 relative'>
              {weekDays.map((dayDate, index) => (
                <WeekDayColumn
                  key={dayDate.toISOString()}
                  date={dayDate}
                  isToday={isSameDay(dayDate, today)}
                  isLast={index === weekDays.length - 1}
                  startHour={calendarStartHour}
                  endHour={calendarEndHour}
                  resources={resources}
                  appointments={filteredAppointments}
                  onEventClick={(apt) => setSelectedAppointment(apt)}
                  onSlotClick={
                    onCreateAppointment
                      ? (date, time) =>
                          onCreateAppointment(
                            date,
                            selectedResourceId === 'all'
                              ? undefined
                              : selectedResourceId,
                            time,
                          )
                      : undefined
                  }
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
