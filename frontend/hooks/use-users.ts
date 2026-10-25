'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import type { ApiUser } from '@/types/auth';

export function useUsers(enabled: boolean) {
  const [users, setUsers] = React.useState<ApiUser[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);
  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    apiClient<ApiUser[]>('/users')
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
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

  return { users, error, reload };
}
