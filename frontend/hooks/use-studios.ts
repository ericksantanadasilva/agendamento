"use client";

import * as React from "react";
import { apiClient } from "@/lib/api";
import type { ApiStudio } from "@/lib/agenda";

export function useStudios(enabled: boolean) {
    const [studios, setStudios] = React.useState<ApiStudio[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [reloadKey, setReloadKey] = React.useState(0);
    const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);

    React.useEffect(() => {
        if (!enabled) return;
        let cancelled = false;

        apiClient<ApiStudio[]>('/studios')
         .then((data) => {
            if (!cancelled) {
                setStudios(data);
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

    return { studios, error, reload };
}