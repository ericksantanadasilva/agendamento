'use client';

import * as React from 'react';
import { Calendar, CalendarX, MapPin, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useNow } from '@/hooks/use-now';
import {
  getAppointmentPermission,
  type AppointmentPermission,
} from '@/lib/appointment-permissions';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import type { AppointmentStatus, CalendarAppointment } from '@/types/calendar';
import { formatHeaderDate } from './utils';

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; dotClass: string }
> = {
  SCHEDULED: {
    label: 'Agendado',
    dotClass: 'bg-warning',
  },
  BLOCKED: {
    label: 'Bloqueado',
    dotClass: 'bg-muted-foreground/70',
  },
};

export interface EventDetailsDialogProps {
  appointment: CalendarAppointment | null;
  resourceName?: string;
  onClose: () => void;
  onEdit?: (appointment: CalendarAppointment) => void;
  onDelete?: (appointmentId: string) => void;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

export function EventDetailsDialog({
  appointment,
  resourceName,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsDialogProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  const [previousAppointment, setPreviousAppointment] =
    React.useState(appointment);
  if (appointment !== previousAppointment) {
    setPreviousAppointment(appointment);
    setIsConfirmingDelete(false);
  }

  const { user } = useAuth();
  const now = useNow();
  if (!appointment) return null;

  const permission: AppointmentPermission = user
    ? getAppointmentPermission(appointment, user, now)
    : { canModify: false };

  const [year, month, day] = appointment.date.split('-').map(Number);
  const dateLabel = formatHeaderDate(new Date(year, month - 1, day));
  const statusInfo = STATUS_CONFIG[appointment.status];

  return (
    <Dialog
      eyebrow='Detalhes da reserva'
      title={appointment.clientName}
      onClose={onClose}
      footer={
        <div className='flex w-full items-center justify-between gap-2.5'>
          <div>
            {onDelete && permission.canModify && (
              <Button
                variant='destructive'
                size='sm'
                className='gap-1.5'
                onClick={() => {
                  if (!isConfirmingDelete) {
                    setIsConfirmingDelete(true);
                    return;
                  }
                  onDelete(appointment.id);
                  onClose();
                }}
              >
                <CalendarX className='h-3.5 w-3.5' />
                {isConfirmingDelete
                  ? 'Confirmar cancelamento?'
                  : 'Cancelar reserva'}
              </Button>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='secondary' size='sm' onClick={onClose}>
              Fechar
            </Button>
            {onEdit && permission.canModify && (
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => {
                  onEdit(appointment);
                  onClose();
                }}
              >
                <Pencil className='h-3.5 w-3.5' />
                Editar
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className='space-y-4 p-5 text-xs'>
        {/* Serviço e status */}
        <div className='flex items-center justify-between gap-2 border-b border-border/50 pb-3'>
          <div>
            <p className='text-2xs text-muted-foreground'>Serviço</p>
            <p className='mt-0.5 text-sm font-medium text-foreground'>
              {appointment.serviceName}
            </p>
          </div>
          <span className='inline-flex items-center gap-1.5 rounded border border-border/60 bg-muted/60 px-2.5 py-0.5 text-2xs text-foreground'>
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                statusInfo.dotClass,
              )}
            />
            <span className='font-medium'>{statusInfo.label}</span>
          </span>
        </div>

        {/* Quando e onde */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded border border-border/60 bg-muted/40 p-2.5'>
            <span className='flex items-center gap-1.5 text-3xs text-muted-foreground'>
              <Calendar className='h-3 w-3' />
              Quando
            </span>
            <p className='mt-1 truncate font-medium text-foreground'>
              {dateLabel}
            </p>
            <p className='mt-0.5 font-mono text-3xs text-muted-foreground'>
              {appointment.startTime} → {appointment.endTime} ·{' '}
              {appointment.durationName ?? `${appointment.durationMinutes} min`}
            </p>
          </div>

          <div className='rounded border border-border/60 bg-muted/40 p-2.5'>
            <span className='flex items-center gap-1.5 text-3xs text-muted-foreground'>
              <MapPin className='h-3 w-3' />
              Local
            </span>
            <p className='mt-1 truncate font-medium text-foreground'>
              {resourceName || 'Estúdio'}
            </p>
          </div>
        </div>

        {permission.canModify && permission.editableUntil && (
          <p className='text-2xs text-muted-foreground'>
            Você pode alterar esta reserva até{' '}
            {formatClock(permission.editableUntil)}.
          </p>
        )}
      </div>
    </Dialog>
  );
}
