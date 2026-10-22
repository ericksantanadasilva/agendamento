import type { CurrentUser } from "@/types/auth";
import type { CalendarAppointment } from "@/types/calendar";

//Mesmo valor do backend (appointments.service.ts). O backend é quem decide.
const USER_EDIT_WINDOW_MS = 5 * 60_000;

export interface AppointmentPermission {
    canModify: boolean;
    editableUntil?: Date;
}

export function getAppointmentPermission(
    appointment: CalendarAppointment,
    user: CurrentUser,
    now: number,
): AppointmentPermission {
    if (appointment.status !== 'SCHEDULED') return { canModify: false };
    if (!appointment.startAt || new Date (appointment.startAt).getTime() <= now) {
        return { canModify: false };
    }
    if (user.role !== 'USER') return { canModify: true };
    if (!appointment.mine || !appointment.createdAt) return { canModify: false };

    const editableUntil = new Date(
        new Date(appointment.createdAt).getTime() + USER_EDIT_WINDOW_MS,
    );
    return { canModify: editableUntil.getTime() > now, editableUntil }
}