'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import {
  agendaItemToAppointment,
  getVisibleRange,
  studioToResource,
  type AgendaItem,
  type ApiStudio,
} from '@/lib/agenda';
import type {
  CalendarAppointment,
  CalendarViewMode,
  StudioResource,
} from '@/types/calendar';

export function useCalendarData(
  selectedDate: Date,
  viewMode: CalendarViewMode,
) {
  const [resources, setResources] = React.useState<StudioResource[]>([]);
  const [appointments, setAppointments] = React.useState<CalendarAppointment[]>(
    [],
  );
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

  const range = React.useMemo(
    () => getVisibleRange(selectedDate, viewMode),
    [selectedDate, viewMode],
  );

  React.useEffect(() => {
    let cancelled = false;

    apiClient<ApiStudio[]>('/studios')
      .then((studios) => {
        if (!cancelled) {
          setResources(
            studios
              .filter((s) => s.active)
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map(studioToResource),
          );
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (resources.length === 0) return;
    let cancelled = false;

    Promise.all(
      resources.map(async (resource) => {
        const query = new URLSearchParams({
          studioId: resource.id,
          from: range.from,
          to: range.to,
        });
        const items = await apiClient<AgendaItem[]>(`/agenda?${query}`);
        return items.map((item) => agendaItemToAppointment(item, resource.id));
      }),
    )
      .then((groups) => {
        if (!cancelled) {
          setAppointments(groups.flat());
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [resources, range.from, range.to, reloadKey]);

  return { resources, appointments, error, reload };
}
