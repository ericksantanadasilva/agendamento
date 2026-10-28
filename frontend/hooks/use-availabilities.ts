'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import type { ApiAvailability } from '@/lib/availability';

interface Loaded {
  studioId: string;
  data: ApiAvailability[];
}

export function useAvailabilities(studioId: string | null) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

  React.useEffect(() => {
    if (!studioId) return;
    let cancelled = false;

    apiClient<ApiAvailability[]>(
      `/availabilities?studioId=${encodeURIComponent(studioId)}`,
    )
      .then((data) => {
        if (!cancelled) {
          setLoaded({ studioId, data });
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [studioId, reloadKey]);

  const availabilities =
    studioId && loaded?.studioId === studioId ? loaded.data : null;

  return { availabilities, error, reload };
}
