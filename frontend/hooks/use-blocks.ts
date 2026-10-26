'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import type { ApiBlock } from '@/lib/blocks';

interface Loaded {
  studioId: string;
  data: ApiBlock[];
}

export function useBlocks(studioId: string | null) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

  React.useEffect(() => {
    if (!studioId) return;
    let cancelled = false;

    apiClient<ApiBlock[]>(`/blocks?studioId=${encodeURIComponent(studioId)}`)
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

  const blocks = studioId && loaded?.studioId === studioId ? loaded.data : null;

  return { blocks, error, reload };
}
