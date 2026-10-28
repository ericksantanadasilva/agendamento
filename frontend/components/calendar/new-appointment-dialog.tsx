'use client';

import * as React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { DEFAULT_SERVICE_LABEL, studioDateTimeToIso } from '@/lib/agenda';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useAppointmentFormOptions } from '@/hooks/use-appointment-form-options';
import type {
  AppointmentSlot,
  CalendarAppointment,
  StudioResource,
} from '@/types/calendar';
import { timeToMinutes } from './utils';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

export interface NewAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resources: StudioResource[];
  selectedDate: Date;
  initialData?: CalendarAppointment | null;
  initialSlot?: AppointmentSlot | null;
  onSaved: () => void;
}

type FormErrors = Partial<
  Record<
    'resourceId' | 'dateStr' | 'startTime' | 'duration' | 'service',
    string
  >
>;

function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatEndTime(startTime: string, minutes: number): string {
  const total = timeToMinutes(startTime) + minutes;
  const hours = String(Math.floor((total % 1440) / 60)).padStart(2, '0');
  const mins = String(total % 60).padStart(2, '0');
  return total >= 1440 ? `${hours}:${mins} (dia seguinte)` : `${hours}:${mins}`;
}

export function NewAppointmentDialog({
  isOpen,
  ...rest
}: NewAppointmentDialogProps) {
  if (!isOpen) return null;
  return <AppointmentForm {...rest} />;
}

function AppointmentForm({
  onClose,
  resources,
  selectedDate,
  initialData,
  initialSlot,
  onSaved,
}: Omit<NewAppointmentDialogProps, 'isOpen'>) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isStaff = user !== null && user.role !== 'USER';
  const {
    durations,
    users,
    error: optionsError,
  } = useAppointmentFormOptions(isStaff);
  const isEditing = Boolean(initialData);

  const initialService =
    initialData && initialData.serviceName !== DEFAULT_SERVICE_LABEL
      ? initialData.serviceName
      : '';
  const initialDurationId = initialData?.durationId;

  const durationOptions = React.useMemo(() => {
    if (durations === null) return null;
    if (
      !initialData?.durationId ||
      durations.some((d) => d.id === initialData.durationId)
    ) {
      return durations;
    }
    return [
      ...durations,
      {
        id: initialData.durationId,
        name: `${initialData.durationName ?? 'Duração atual'} (desativada)`,
        minutes: initialData.durationMinutes,
        active: false,
      },
    ];
  }, [durations, initialData]);

  const [ownerId, setOwnerId] = React.useState('');
  const [resourceId, setResourceId] = React.useState(
    initialData?.resourceId ??
      initialSlot?.resourceId ??
      resources[0]?.id ??
      '',
  );
  const [dateStr, setDateStr] = React.useState(
    () => initialData?.date ?? formatDateToIso(selectedDate),
  );
  const [startTime, setStartTime] = React.useState(
    initialData?.startTime ?? initialSlot?.time ?? '10:00',
  );
  const [chosenDurationId, setChosenDurationId] = React.useState<string | null>(
    null,
  );
  const [service, setService] = React.useState(initialService);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const durationId =
    chosenDurationId ??
    initialDurationId ??
    (isEditing ? '' : (durations?.[0]?.id ?? ''));
  const selectedDuration = durationOptions?.find((d) => d.id === durationId);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedService = service.trim();
    const nextErrors: FormErrors = {};
    if (!resourceId) nextErrors.resourceId = 'Escolha o estúdio';
    if (!dateStr) nextErrors.dateStr = 'Informe a data';
    if (!startTime) nextErrors.startTime = 'Informe o horário de início';
    if (!durationId) nextErrors.duration = 'Escolha a duração';
    if (!isEditing && !trimmedService) nextErrors.service = 'Informe o serviço';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (initialData) {
        const body: Record<string, string> = {};
        if (resourceId !== initialData.resourceId) body.studioId = resourceId;
        if (
          dateStr !== initialData.date ||
          startTime !== initialData.startTime
        ) {
          body.startAt = studioDateTimeToIso(dateStr, startTime);
        }
        if (chosenDurationId && chosenDurationId !== initialDurationId) {
          body.durationId = chosenDurationId;
        }
        if (trimmedService && trimmedService !== initialService) {
          body.service = trimmedService;
        }

        if (Object.keys(body).length === 0) {
          onClose();
          return;
        }

        await apiClient(`/appointments/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Reserva atualizada.');
      } else {
        await apiClient('/appointments', {
          method: 'POST',
          body: JSON.stringify({
            studioId: resourceId,
            durationId,
            startAt: studioDateTimeToIso(dateStr, startTime),
            service: trimmedService,
            ...(ownerId ? { userId: ownerId } : {}),
          }),
        });
        showToast('Reserva criada.');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a reserva.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-background/80 p-4 backdrop-blur-xs animate-in fade-in duration-150'
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='flex max-h-[90vh] w-full max-w-lg cursor-default flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-xl shadow-black/40'
        role='dialog'
        aria-modal='true'
        aria-labelledby='new-appointment-title'
      >
        <div className='flex items-center justify-between border-b border-border bg-muted/30 p-4'>
          <div className='space-y-0.5'>
            <span className='font-mono text-3xs uppercase tracking-wider text-muted-foreground'>
              {isEditing ? 'Gestão de reserva' : 'Reserva de estúdio'}
            </span>
            <h2
              id='new-appointment-title'
              className='text-sm font-semibold text-foreground sm:text-base'
            >
              {isEditing ? 'Editar reserva' : 'Nova reserva'}
            </h2>
          </div>
          <Button
            type='button'
            variant='icon'
            size='icon'
            onClick={onClose}
            aria-label='Fechar'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-1 flex-col overflow-y-auto'
        >
          <div className='space-y-4 p-5 text-xs'>
            {isStaff && !isEditing && (
              <Select
                id='appointment-owner'
                label='Reservar para'
                value={ownerId}
                onValueChange={setOwnerId}
              >
                <option value=''>Eu mesmo</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.email}
                  </option>
                ))}
              </Select>
            )}

            <Select
              id='appointment-studio'
              label='Estúdio'
              value={resourceId}
              onValueChange={(value) => {
                setResourceId(value);
                clearError('resourceId');
              }}
              error={errors.resourceId}
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.subtitle ? ` · ${r.subtitle}` : ''}
                </option>
              ))}
            </Select>

            <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
              <DatePicker
                id='appointment-date'
                label='Data'
                value={dateStr}
                onValueChange={(value) => {
                  setDateStr(value);
                  clearError('dateStr');
                }}
                error={errors.dateStr}
              />
              <TimePicker
                id='appointment-start'
                label='Início'
                value={startTime}
                onValueChange={(value) => {
                  setStartTime(value);
                  clearError('startTime');
                }}
                error={errors.startTime}
              />
            </div>

            <Select
              id='appointment-duration'
              label='Duração'
              value={durationId}
              onValueChange={(value) => {
                setChosenDurationId(value);
                clearError('duration');
              }}
              disabled={durations === null}
              error={errors.duration}
            >
              {durationOptions === null ? (
                <option value=''>Carregando...</option>
              ) : (
                <>
                  <option value='' disabled>
                    Selecione...
                  </option>
                  {durationOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.minutes} min
                    </option>
                  ))}
                </>
              )}
            </Select>

            {selectedDuration && startTime && (
              <div className='flex items-center gap-1.5 text-2xs text-muted-foreground'>
                <Clock className='h-3 w-3 shrink-0 text-primary/70' />
                <span>
                  Termina às{' '}
                  <strong className='font-mono text-foreground'>
                    {formatEndTime(startTime, selectedDuration.minutes)}
                  </strong>
                </span>
              </div>
            )}

            <Input
              id='appointment-service'
              label='Serviço'
              placeholder='Ex: Gravação da aula 12, Transmissão ao vivo...'
              maxLength={120}
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                clearError('service');
              }}
              error={errors.service}
            />

            {optionsError && (
              <p role='alert' className='text-2xs font-medium text-destructive'>
                {optionsError}
              </p>
            )}
          </div>

          <div className='mt-auto flex items-center justify-end gap-2 border-t border-border bg-muted/20 p-4'>
            <Button type='button' variant='outline' size='sm' onClick={onClose}>
              Fechar
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              className='gap-1.5'
              disabled={submitting || durations === null}
            >
              <Check className='h-3.5 w-3.5' />
              {submitting
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Reservar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
