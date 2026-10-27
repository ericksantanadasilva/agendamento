'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import {
  studioDateTimeToIso,
  toStudioParts,
  type ApiStudio,
} from '@/lib/agenda';
import { ApiError, apiClient } from '@/lib/api';
import { formatBlockRange } from '@/lib/blocks';
import { useToast } from '@/lib/toast-context';

const FORM_ID = 'block-form';

interface BlockPayload {
  studioId: string;
  startAt: string;
  endAt: string;
  reason?: string;
}

interface ConflictingAppointment {
  id: string;
  startAt: string;
  endAt: string;
  user: { name: string; email: string };
}

interface Conflict {
  payload: BlockPayload;
  appointments: ConflictingAppointment[];
}

function parseConflicts(body: unknown): ConflictingAppointment[] | null {
  if (typeof body !== 'object' || body === null) return null;
  const appointments = (body as { appointments?: unknown }).appointments;
  if (!Array.isArray(appointments) || appointments.length === 0) return null;
  return appointments as ConflictingAppointment[];
}

function todayInStudio(): string {
  return toStudioParts(new Date().toISOString()).date;
}

export interface BlockFormDialogProps {
  studios: ApiStudio[];
  defaultStudioId: string;
  onClose: () => void;
  onSaved: (studioId: string) => void;
}

export function BlockFormDialog({
  studios,
  defaultStudioId,
  onClose,
  onSaved,
}: BlockFormDialogProps) {
  const { showToast } = useToast();
  const [studioId, setStudioId] = React.useState(defaultStudioId);
  const [startDate, setStartDate] = React.useState(todayInStudio);
  const [startTime, setStartTime] = React.useState('08:00');
  const [endDate, setEndDate] = React.useState(todayInStudio);
  const [endTime, setEndTime] = React.useState('12:00');
  const [reason, setReason] = React.useState('');
  const [rangeError, setRangeError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [conflict, setConflict] = React.useState<Conflict | null>(null);

  async function submit(payload: BlockPayload, cancelConflicting: boolean) {
    setSubmitting(true);
    try {
      await apiClient('/blocks', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          ...(cancelConflicting ? { cancelConflicting: true } : {}),
        }),
      });
      const canceled = conflict?.appointments.length ?? 0;
      showToast(
        cancelConflicting
          ? `Bloqueio criado e ${canceled} reserva(s) cancelada(s).`
          : 'Bloqueio criado.',
      );
      onSaved(payload.studioId);
      onClose();
    } catch (err) {
      const found =
        !cancelConflicting && err instanceof ApiError && err.statusCode === 409
          ? parseConflicts(err.body)
          : null;
      if (found) {
        setConflict({ payload, appointments: found });
        return;
      }
      showToast(
        err instanceof Error
          ? err.message
          : 'Não foi possível criar o bloqueio.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLElement>) {
    event.preventDefault();

    if (!startDate || !startTime || !endDate || !endTime) {
      setRangeError('Informe a data e a hora de início e de fim');
      return;
    }

    const startAt = studioDateTimeToIso(startDate, startTime);
    const endAt = studioDateTimeToIso(endDate, endTime);
    if (new Date(endAt) <= new Date(startAt)) {
      setRangeError('O fim precisa ser depois do início');
      return;
    }

    const trimmedReason = reason.trim();
    void submit(
      {
        studioId,
        startAt,
        endAt,
        ...(trimmedReason ? { reason: trimmedReason } : {}),
      },
      false,
    );
  }

  if (conflict) {
    const count = conflict.appointments.length;
    const plural = count === 1 ? '' : 's';

    return (
      <Dialog
        eyebrow="Atenção"
        title="Confirmar cancelamentos"
        onClose={onClose}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConflict(null)}
              disabled={submitting}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => void submit(conflict.payload, true)}
            >
              {submitting
                ? 'Cancelando...'
                : `Cancelar ${count} reserva${plural} e bloquear`}
            </Button>
          </>
        }
      >
        <div className="space-y-4 p-5 text-xs">
          <p className="text-sm font-medium text-foreground">
            Este bloqueio cancela {count} reserva{plural}.
          </p>
          <p className="text-muted-foreground">
            As reservas abaixo estão dentro do período escolhido. Se você
            continuar, elas são canceladas e o sistema não avisa ninguém, então
            avise as pessoas por fora.
          </p>
          <ul className="divide-y divide-border/60 rounded-[var(--radius)] border border-border">
            {conflict.appointments.map((appointment) => (
              <li key={appointment.id} className="space-y-0.5 p-3">
                <p className="font-mono text-foreground">
                  {formatBlockRange(appointment.startAt, appointment.endAt)}
                </p>
                <p className="text-muted-foreground">
                  {appointment.user.name} · {appointment.user.email}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      eyebrow="Operação"
      title="Novo bloqueio"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            size="sm"
            className="gap-1.5"
            disabled={submitting}
          >
            <Check className="h-3.5 w-3.5" />
            {submitting ? 'Verificando...' : 'Criar bloqueio'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="space-y-4 p-5 text-xs"
      >
        <Select
          id="block-studio"
          label="Estúdio"
          value={studioId}
          onChange={(e) => setStudioId(e.target.value)}
        >
          {studios.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name}
              {studio.active ? '' : ' (desativado)'}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Input
            id="block-start-date"
            label="Data de início"
            type="date"
            value={startDate}
            onChange={(e) => {
              const value = e.target.value;
              setStartDate(value);
              if (endDate < value) setEndDate(value);
              setRangeError(null);
            }}
          />
          <Input
            id="block-start-time"
            label="Hora de início"
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setRangeError(null);
            }}
          />
          <Input
            id="block-end-date"
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setRangeError(null);
            }}
          />
          <Input
            id="block-end-time"
            label="Hora de fim"
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setRangeError(null);
            }}
          />
        </div>
        {rangeError && (
          <p role="alert" className="text-2xs font-medium text-destructive">
            {rangeError}
          </p>
        )}

        <Input
          id="block-reason"
          label="Motivo (opcional)"
          placeholder="Ex: Manutenção, feriado, evento"
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Dialog>
  );
}
