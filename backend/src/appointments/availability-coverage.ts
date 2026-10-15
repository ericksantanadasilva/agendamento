import { DayOfWeek } from '@prisma/client';

export const STUDIO_UTC_OFFSET_MINUTES = -180;

const MINUTES_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTES_MS;

const DAYS: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export interface AvailabilityPeriod {
  dayOfWeek: DayOfWeek;
  startMinute: number;
  endMinute: number;
}

export function splitByLocalDay(
  startAt: Date,
  endAt: Date,
): AvailabilityPeriod[] {
  const offsetMs = STUDIO_UTC_OFFSET_MINUTES * MINUTES_MS;
  const endLocal = endAt.getTime() + offsetMs;
  let cursor = startAt.getTime() + offsetMs;

  const pieces: AvailabilityPeriod[] = [];
  while (cursor < endLocal) {
    const dayStart = Math.floor(cursor / DAY_MS) * DAY_MS;
    const pieceEnd = Math.min(endLocal, dayStart + DAY_MS);

    pieces.push({
      dayOfWeek: DAYS[new Date(dayStart).getUTCDay()],
      startMinute: (cursor - dayStart) / MINUTES_MS,
      endMinute: (pieceEnd - dayStart) / MINUTES_MS,
    });
    cursor = pieceEnd;
  }
  return pieces;
}

function isPieceCovered(
  piece: AvailabilityPeriod,
  periods: AvailabilityPeriod[],
): boolean {
  const sameDay = periods
    .filter((p) => p.dayOfWeek === piece.dayOfWeek)
    .sort((a, b) => a.startMinute - b.startMinute);

  let covered = piece.startMinute;
  for (const period of sameDay) {
    if (period.startMinute > covered) break;
    covered = Math.max(covered, period.endMinute);
    if (covered >= piece.endMinute) return true;
  }
  return covered >= piece.endMinute;
}

export function isWithinAvailability(
  startAt: Date,
  endAt: Date,
  periods: AvailabilityPeriod[],
): boolean {
  if (endAt <= startAt) return false;
  return splitByLocalDay(startAt, endAt).every((piece) =>
    isPieceCovered(piece, periods),
  );
}
