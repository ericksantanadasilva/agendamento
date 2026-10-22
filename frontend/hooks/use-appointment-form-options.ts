"use client";

import * as React from "react";
import { apiClient } from "@/lib/api";

export interface ApiDuration {
  id: string;
  name: string;
  minutes: number;
  active: boolean;
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export function useAppointmentFormOptions(isStaff: boolean) {
  const [durations, setDurations] = React.useState<ApiDuration[] | null>(null);
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    apiClient<ApiDuration[]>("/durations")
      .then((data) => {
        if (!cancelled) setDurations(data.filter((d) => d.active));
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    if (isStaff) {
      apiClient<UserOption[]>("/users/options")
        .then((data) => {
          if (!cancelled) setUsers(data);
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [isStaff]);

  return { durations, users, error };
}