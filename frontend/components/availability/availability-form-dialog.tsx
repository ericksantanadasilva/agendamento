'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { timeToMinutes } from '../calendar/utils';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { apiClient } from '@/lib/api';
import {
  DAYS,
  minutesToTime,
  type ApiAvailability,
  type DayOfWeek,
} from '@/lib/availability';
import { useToast } from '@/lib/toast-context';
import { TimePicker } from '@/components/ui/time-picker';

const FORM_ID = 'availability-form';

export interface AvailabilityFormDialogProps {
  studioId: string;
  day: DayOfWeek;
  period: ApiAvailability | null;
  onClose: () => void;
  onSaved: () => void;
}

function toInputTime(minutes: number): string {
  return minutesToTime(minutes % 1440);
}

function endToMinutes(end: string): number {
  const minutes = timeToMinutes(end);
  return minutes === 0 ? 1440 : minutes;
}

export function AvailabilityFormDialog({
  studioId,
  day,
  period,
  onClose,
  onSaved,
}: AvailabilityFormDialogProps) {
  const { showToast } = useToast();
  const [startTime, setStartTime] = React.useState(
    period ? toInputTime(period.startMinute) : '08:00',
  );
  const [endTime, setEndTime] = React.useState(
    period ? toInputTime(period.endMinute) : '12:00',
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const dayLabel = DAYS.find((d) => d.value === day)?.label ?? '';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startTime || !endTime) {
      setError('Informe o início e o fim');
      return;
    }
    const startMinute = timeToMinutes(startTime);
    const endMinute = endToMinutes(endTime);
    if (endMinute <= startMinute) {
      setError('O fim precisa ser depois do início');
      return;
    }

    setSubmitting(true);
    try {
      if (period) {
        const body: Record<string, number> = {};
        if (startMinute !== period.startMinute) body.startMinute = startMinute;
        if (endMinute !== period.endMinute) body.endMinute = endMinute;

        if (Object.keys(body).length === 0) {
          onClose();
          return;
        }

        await apiClient(`/availabilities/${period.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Período atualizado.');
      } else {
        await apiClient('/availabilities', {
          method: 'POST',
          body: JSON.stringify({
            studioId,
            dayOfWeek: day,
            startMinute,
            endMinute,
          }),
        });
        showToast('Período criado.');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o período.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      eyebrow={dayLabel}
      title={period ? 'Editar período' : 'Novo período'}
      onClose={onClose}
      footer={
        <>
          <Button type='button' variant='outline' size='sm' onClick={onClose}>
            Fechar
          </Button>
          <Button
            type='submit'
            form={FORM_ID}
            variant='primary'
            size='sm'
            className='gap-1.5'
            disabled={submitting}
          >
            <Check className='-3.5 w-3.5' />
            {submitting
              ? 'Salvando...'
              : period
                ? 'Salvar alterações'
                : 'Criar período'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className='space-y-4 p-5 text-xs'
      >
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
          <TimePicker
            id='availability-start'
            label='Início'
            value={startTime}
            onValueChange={(value) => {
              setStartTime(value);
              setError(null);
            }}
          />
          <TimePicker
            id='availability-end'
            label='Fim'
            value={endTime}
            onValueChange={(value) => {
              setEndTime(value);
              setError(null);
            }}
            helperText='00:00 significa meia-noite'
          />
        </div>
        {error && (
          <p role='alert' className='text-2xs font-medium text-destructive'>
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
