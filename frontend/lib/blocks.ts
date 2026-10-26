import { toStudioParts } from './agenda';

export interface ApiBlock {
  id: string;
  studioId: string;
  createdById: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  active: boolean;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatBlockRange(startAt: string, endAt: string): string {
  const start = toStudioParts(startAt);
  const end = toStudioParts(endAt);

  if (start.date === end.date) {
    return `${formatDate(start.date)} · ${start.time} - ${end.time}`;
  }
  return `${formatDate(start.date)} ${start.time} → ${formatDate(end.date)} ${end.time}`;
}
