'use client';

import * as React from 'react';
import { CalendarAppointment, AppointmentStatus } from '@/types/calendar';
import { timeToPixels, durationToPixels } from './utils';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export interface CalendarEventProps {
  appointment: CalendarAppointment;
  startHour?: number;
  onClick?: (appointment: CalendarAppointment) => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  {
    label: string;
    dotClass: string;
    borderAccentClass: string;
  }
> = {
  SCHEDULED: {
    label: 'Agendado',
    dotClass: 'bg-warning',
    borderAccentClass: 'border-l-warning',
  },
  BLOCKED: {
    label: 'Bloqueio',
    dotClass: 'bg-muted-foreground/60',
    borderAccentClass: 'border-l-border',
  },
};

export function CalendarEvent({
  appointment,
  startHour = 0,
  onClick,
}: CalendarEventProps) {
  const top = timeToPixels(appointment.startTime, startHour);
  const height = Math.max(
    durationToPixels(appointment.durationMinutes) - 2,
    26,
  );
  const isShort = height <= 38; // <= 30 minutos
  const isMedium = height > 38 && height < 80; // 45m a 60m
  const isLong = height >= 80; // 90m a 150m+
  const isBlocked = appointment.status === 'BLOCKED';
  const statusInfo =
    STATUS_CONFIG[appointment.status] || STATUS_CONFIG.SCHEDULED;

  return (
    <div
      onClick={() => onClick?.(appointment)}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
      className={cn(
        'absolute left-1 right-1 sm:left-1.5 sm:right-1.5 rounded-r-[2px] rounded-l-none text-left transition-colors duration-150 cursor-pointer overflow-hidden select-none z-10',
        'border-l-[2.5px]',
        statusInfo.borderAccentClass,
        isBlocked
          ? 'bg-muted/40 opacity-70 hover:bg-muted/60'
          : 'bg-surface-elevated hover:bg-surface-elevated-hover',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
      )}
      role='button'
      tabIndex={0}
      title={`${appointment.clientName} · ${appointment.serviceName} (${appointment.startTime} - ${appointment.endTime})`}
    >
      {/* Caso 1: Evento Curto (30m) - Essencial e compacto */}
      {isShort && (
        <div className='flex flex-col justify-center h-full px-2 min-w-0'>
          <div className='flex items-baseline gap-1.5 min-w-0'>
            <span className='text-2xs font-semibold text-foreground truncate leading-tight'>
              {appointment.clientName}
            </span>
            <span className='text-3xs text-muted-foreground truncate leading-tight hidden sm:inline'>
              · {appointment.serviceName}
            </span>
          </div>
          <span className='text-4xs text-muted-foreground truncate leading-tight sm:hidden'>
            {appointment.serviceName}
          </span>
        </div>
      )}

      {/* Caso 2: Evento Médio (45m a 60m) - Hierarquia limpa e tempo discreto */}
      {isMedium && (
        <div className='flex flex-col justify-between h-full px-2.5 py-1.5 min-w-0'>
          <div className='min-w-0 space-y-0.5'>
            <div className='font-mono text-4xs text-muted-foreground/75 leading-none'>
              {appointment.startTime} → {appointment.endTime}
            </div>
            <h4 className='text-xs font-semibold text-foreground tracking-tight truncate leading-tight'>
              {appointment.clientName}
            </h4>
            <p className='text-3xs text-muted-foreground truncate leading-tight'>
              {appointment.serviceName}
            </p>
          </div>
        </div>
      )}

      {/* Caso 3: Evento Longo (90m+) - Presença, leitura espaçada e status discreto */}
      {isLong && (
        <div className='flex flex-col justify-between h-full px-3 py-2 min-w-0'>
          <div className='space-y-1 min-w-0'>
            <div className='font-mono text-3xs text-muted-foreground/80 leading-none'>
              {appointment.startTime} → {appointment.endTime}
            </div>
            <h4 className='text-xs font-semibold text-foreground tracking-tight line-clamp-2 leading-snug'>
              {appointment.clientName}
            </h4>
            <p className='text-2xs text-muted-foreground line-clamp-2 leading-snug'>
              {appointment.serviceName}
            </p>
          </div>

          <div className='flex items-center justify-between gap-2 pt-1.5 mt-auto border-t border-border/25'>
            <span className='text-3xs text-muted-foreground/80 truncate font-medium'>
              {appointment.durationName ?? `${appointment.durationMinutes} min`}
            </span>

            {/* Status discreto: dot semântico + texto neutro, sem parecer um botão */}
            <div className='flex items-center gap-1.5 text-4xs text-muted-foreground shrink-0'>
              {isBlocked ? (
                <Lock className='w-2.5 h-2.5 text-muted-foreground shrink-0' />
              ) : (
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    statusInfo.dotClass,
                  )}
                />
              )}
              <span className='font-medium'>{statusInfo.label}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
