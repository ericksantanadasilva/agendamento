'use client';

import * as React from 'react';
import { CalendarAppointment, StudioResource } from '@/types/calendar';
import { timeToPixels, durationToPixels, EventLayoutPosition } from './utils';
import { getStudioConfig } from './studio-config';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export interface WeekCalendarEventProps {
  appointment: CalendarAppointment;
  resources: StudioResource[];
  startHour?: number;
  layoutPosition?: EventLayoutPosition;
  onClick?: (appointment: CalendarAppointment) => void;
}

export function WeekCalendarEvent({
  appointment,
  resources,
  startHour = 0,
  layoutPosition,
  onClick,
}: WeekCalendarEventProps) {
  const top = timeToPixels(appointment.startTime, startHour);
  const height = Math.max(
    durationToPixels(appointment.durationMinutes) - 2,
    24,
  );
  const isShort = height <= 38; // <= 30 minutos
  const isBlocked = appointment.status === 'BLOCKED';

  const totalCols = layoutPosition?.totalCols ?? 1;
  const isSplit = totalCols > 1;

  const studioConfig = getStudioConfig(appointment.resourceId, resources);

  // Posicionamento relativo horizontal para sobreposições
  const leftPercent = layoutPosition ? layoutPosition.leftPercent : 0;
  const widthPercent = layoutPosition ? layoutPosition.widthPercent : 100;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(appointment);
      }}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${leftPercent}% + 1.5px)`,
        width: `calc(${widthPercent}% - 3px)`,
      }}
      className={cn(
        'absolute rounded-r-[2px] rounded-l-none text-left transition-colors duration-150 cursor-pointer overflow-hidden select-none z-10',
        'border-l-[3px]',
        studioConfig.borderClass,
        isBlocked
          ? 'bg-muted/40 opacity-70 hover:bg-muted/60'
          : 'bg-surface-elevated hover:bg-surface-elevated-hover',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
      )}
      role='button'
      tabIndex={0}
      title={`${studioConfig.name} · ${appointment.clientName} · ${appointment.serviceName} (${appointment.startTime} - ${appointment.endTime})`}
    >
      {/* Caso 1: Evento Curto (<= 30 min) */}
      {isShort ? (
        <div className='flex items-center justify-between h-full px-1.5 gap-1 min-w-0'>
          <div className='flex items-center gap-1 min-w-0 truncate'>
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                studioConfig.dotClass,
              )}
              title={studioConfig.name}
            />
            <span className='text-2xs font-semibold text-foreground truncate leading-tight'>
              {appointment.clientName}
            </span>
          </div>
          <span className='font-mono text-4xs text-muted-foreground/70 shrink-0'>
            {appointment.startTime}
          </span>
        </div>
      ) : isSplit ? (
        /* Caso 2: Evento Concorrente Dividindo Largura (Modo Ultra-Limpo) */
        <div className='flex flex-col justify-between h-full px-1.5 sm:px-2 py-1 min-w-0'>
          <div className='min-w-0 space-y-0.5'>
            <div className='flex items-center justify-between gap-1 leading-none'>
              <span className='font-mono text-4xs text-muted-foreground/80 truncate'>
                {appointment.startTime}
              </span>
              <span
                className={cn(
                  'text-4xs font-mono font-medium px-1 rounded-xs border leading-tight shrink-0',
                  studioConfig.badgeClass,
                )}
              >
                {studioConfig.shortName}
              </span>
            </div>
            <h4 className='text-2xs font-semibold text-foreground tracking-tight truncate leading-tight'>
              {appointment.clientName}
            </h4>
            {height >= 58 && (
              <p className='text-3xs text-muted-foreground truncate leading-tight'>
                {appointment.serviceName}
              </p>
            )}
          </div>
          {height >= 85 && (
            <div className='pt-0.5 text-4xs text-muted-foreground/75 truncate mt-auto border-t border-border/15'>
              {studioConfig.name}
            </div>
          )}
        </div>
      ) : (
        /* Caso 3: Largura Completa (Sem concorrência ou com filtro de estúdio ativo) */
        <div className='flex flex-col justify-between h-full px-2.5 py-1.5 min-w-0'>
          <div className='min-w-0 space-y-0.5'>
            <div className='flex items-center justify-between gap-1 leading-none'>
              <span className='font-mono text-4xs text-muted-foreground/75 truncate'>
                {appointment.startTime} - {appointment.endTime}
              </span>
              <span
                className={cn(
                  'font-mono text-4xs px-1.5 py-0.2 rounded-xs border shrink-0 font-medium',
                  studioConfig.badgeClass,
                )}
                title={studioConfig.name}
              >
                {studioConfig.name}
              </span>
            </div>

            <h4 className='text-xs font-semibold text-foreground tracking-tight truncate leading-snug'>
              {appointment.clientName}
            </h4>

            <p className='text-3xs text-muted-foreground truncate leading-tight'>
              {appointment.serviceName}
            </p>
          </div>

          {height >= 75 && (
            <div className='flex items-center justify-between gap-1 pt-1 mt-auto border-t border-border/20 text-4xs text-muted-foreground'>
              <span className='truncate'>{studioConfig.name}</span>
              {isBlocked && <Lock className='w-2.5 h-2.5 shrink-0' />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
