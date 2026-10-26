import {
  getMonthCalendarDays,
  getWeekDates,
  timeToMinutes,
  toISODateString,
} from '@/components/calendar/utils';
import type {
  CalendarAppointment,
  CalendarViewMode,
  StudioResource,
} from '@/types/calendar';

// fuso do backend: São Paulo, sem horário de verão
const STUDIO_OFFSET = '-03:00';
const STUDIO_OFFSET_MS = -3 * 60 * 60_000;

export const DEFAULT_SERVICE_LABEL = 'Reserva';

export interface ApiStudio {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface ApiDuration {
  id: string;
  name: string;
  minutes: number;
  active: boolean;
}

export interface AgendaItem {
  type: 'APPOINTMENT' | 'BLOCK';
  startAt: string;
  endAt: string;
  mine?: boolean;
  id?: string;
  userId?: string;
  userName?: string;
  durationName?: string;
  durationId?: string;
  createdAt?: string;
  reason?: string | null;
  service?: string | null;
}

export function studioToResource(studio: ApiStudio): StudioResource {
  return {
    id: studio.id,
    name: studio.name,
    subtitle: studio.description ?? undefined,
  };
}

export function toStudioParts(iso: string) {
  const shifted = new Date(
    new Date(iso).getTime() + STUDIO_OFFSET_MS,
  ).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}

export function agendaItemToAppointment(
  item: AgendaItem,
  studioId: string,
): CalendarAppointment {
  const start = toStudioParts(item.startAt);
  const end = toStudioParts(item.endAt);
  const endTime = end.date === start.date ? end.time : '24:00';
  const isBlock = item.type === 'BLOCK';

  return {
    id: item.id ?? `${item.type}-${studioId}-${item.startAt}`,
    resourceId: studioId,
    clientName: isBlock
      ? (item.reason ?? 'Bloqueado')
      : (item.userName ?? 'Ocupado'),
    serviceName: isBlock ? 'Bloqueio' : (item.service ?? DEFAULT_SERVICE_LABEL),
    date: start.date,
    startTime: start.time,
    endTime,
    durationMinutes: timeToMinutes(endTime) - timeToMinutes(start.time),
    status: isBlock ? 'BLOCKED' : 'SCHEDULED',
    mine: item.mine,
    durationName: item.durationName,
    durationId: item.durationId,
    createdAt: item.createdAt,
    startAt: item.startAt,
  };
}

function startOfStudioDay(date: Date): string {
  return new Date(
    `${toISODateString(date)}T00:00:00${STUDIO_OFFSET}`,
  ).toISOString();
}

function dayAfter(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

export function getVisibleRange(date: Date, viewMode: CalendarViewMode) {
  let first = date;
  let last = date;

  if (viewMode === 'week') {
    const week = getWeekDates(date);
    first = week[0];
    last = week[6];
  } else if (viewMode === 'month') {
    const days = getMonthCalendarDays(date);
    first = days[0].date;
    last = days[days.length - 1].date;
  }

  return {
    from: startOfStudioDay(first),
    to: startOfStudioDay(dayAfter(last)),
  };
}

export function studioDateTimeToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00${STUDIO_OFFSET}`).toISOString();
}
