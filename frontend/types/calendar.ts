export type CalendarViewMode = 'day' | 'week' | 'month';

// A agenda só devolve reservas agendadas e bloqueios; as canceladas não chegam ao calendário.
export type AppointmentStatus = 'SCHEDULED' | 'BLOCKED';

export interface StudioResource {
  id: string;
  name: string;
  subtitle?: string;
}

export interface CalendarAppointment {
  id: string;
  resourceId: string;
  clientName: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  mine?: boolean;
  durationName?: string;
  durationId?: string;
  createdAt?: string;
  startAt?: string; // ISO UTC
}

export interface AppointmentSlot {
  resourceId?: string;
  time: string; // HH:mm
}
