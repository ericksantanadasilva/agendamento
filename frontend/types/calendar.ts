export type CalendarViewMode = "day" | "week" | "month";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "BLOCKED";

export interface StudioResource {
  id: string;
  name: string;
  subtitle?: string;
  capacity?: number;
  type?: string;
}

export interface CalendarAppointment {
  id: string;
  resourceId: string;
  clientName: string;
  serviceName: string;
  technicianName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  mine?: boolean;
  durationName?: string;
  createdAt?: string;
  startAt?: string; //ISO UTC
}
