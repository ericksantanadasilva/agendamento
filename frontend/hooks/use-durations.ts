'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import type { ApiDuration } from '@/lib/agenda';

export function useDurations(enabled: boolean) {
  const [durations, setDurations] = React.useState<ApiDuration[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    apiClient<ApiDuration[]>('/durations')
      .then((data) => {
        if (!cancelled) {
          setDurations(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  return { durations, error, reload };
}
