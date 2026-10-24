export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const DAYS:  { value: DayOfWeek; label: string }[] = [
    { value: "MONDAY", label: "Segunda-feira" },
    { value: "TUESDAY", label: "Terça-feira" },
    { value: "WEDNESDAY", label: "Quarta-feira" },
    { value: "THURSDAY", label: "Quinta-feira" },
    { value: "FRIDAY", label: "Sexta-feira" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
];

export interface ApiAvailability {
    id: string;
    studioId: string;
    dayOfWeek: DayOfWeek;
    startMinute: number;
    endMinute: number;
    active: boolean;
}

export function minutesToTime(minutes: number): string {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours}:${mins}`;
}