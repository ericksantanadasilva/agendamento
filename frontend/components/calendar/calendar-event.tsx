"use client";

import * as React from "react";
import { CalendarAppointment, AppointmentStatus } from "@/types/calendar";
import { timeToPixels, durationToPixels } from "./utils";
import { cn } from "@/lib/utils";
import { Lock, User } from "lucide-react";

export interface CalendarEventProps {
  appointment: CalendarAppointment;
  onClick?: (appointment: CalendarAppointment) => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  CONFIRMED: {
    label: "Confirmado",
    dotClass: "bg-primary",
    badgeClass: "text-foreground",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    dotClass: "bg-info",
    badgeClass: "text-foreground",
  },
  SCHEDULED: {
    label: "Agendado",
    dotClass: "bg-warning",
    badgeClass: "text-muted-foreground",
  },
  COMPLETED: {
    label: "Concluído",
    dotClass: "bg-muted-foreground/60",
    badgeClass: "text-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelado",
    dotClass: "bg-destructive",
    badgeClass: "text-destructive",
  },
  BLOCKED: {
    label: "Bloqueio",
    dotClass: "bg-muted-foreground",
    badgeClass: "text-muted-foreground",
  },
};

export function CalendarEvent({ appointment, onClick }: CalendarEventProps) {
  const top = timeToPixels(appointment.startTime);
  const height = Math.max(durationToPixels(appointment.durationMinutes) - 2, 28); // margem sutil de 2px
  const isCompact = height < 52;
  const isBlocked = appointment.status === "BLOCKED";
  const statusInfo = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.SCHEDULED;

  return (
    <div
      onClick={() => onClick?.(appointment)}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
      className={cn(
        "absolute inset-x-1 sm:inset-x-1.5 rounded-[var(--radius)] border p-2 sm:p-2.5 text-left transition-all duration-150 cursor-pointer overflow-hidden select-none z-10",
        // Superfície neutra sutil com elevação limpa
        isBlocked
          ? "bg-[#141414] border-border/70 opacity-80 hover:border-border"
          : "bg-muted/90 hover:bg-muted border-border hover:border-border/90 hover:shadow-xs",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
      )}
      role="button"
      tabIndex={0}
      title={`${appointment.startTime} - ${appointment.endTime} | ${appointment.clientName} (${appointment.serviceName})`}
    >
      {/* Layout Compacto para durações curtas (30m - 45m) */}
      {isCompact ? (
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusInfo.dotClass)} />
            <span className="font-mono text-[10px] text-muted-foreground shrink-0">
              {appointment.startTime}
            </span>
            <span className="text-xs font-medium text-foreground truncate">
              {appointment.clientName}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline font-mono shrink-0">
            {appointment.durationMinutes}m
          </span>
        </div>
      ) : (
        /* Layout Detalhado para 60m+ */
        <div className="flex flex-col justify-between h-full space-y-1">
          <div>
            {/* Linha de Horário e Status */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusInfo.dotClass)} />
                <span className="font-mono text-[10px] text-muted-foreground tracking-tight">
                  {appointment.startTime} → {appointment.endTime}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0">
                {appointment.durationMinutes}m
              </span>
            </div>

            {/* Cliente / Título Principal */}
            <h4 className="text-xs font-semibold text-foreground tracking-tight line-clamp-1">
              {appointment.clientName}
            </h4>

            {/* Serviço */}
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
              {appointment.serviceName}
            </p>
          </div>

          {/* Rodapé do Evento: Técnico ou Observação */}
          {height >= 80 && (
            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
              {appointment.technicianName ? (
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3 shrink-0 opacity-70" />
                  <span className="truncate">{appointment.technicianName}</span>
                </span>
              ) : (
                <span className="italic">{statusInfo.label}</span>
              )}
              {isBlocked && (
                <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <Lock className="w-3 h-3" />
                  <span>Bloqueado</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
