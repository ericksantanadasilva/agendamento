"use client";

import * as React from "react";
import { CalendarAppointment, AppointmentStatus } from "@/types/calendar";
import { timeToPixels, durationToPixels } from "./utils";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export interface CalendarEventProps {
  appointment: CalendarAppointment;
  startHour?: number;
  onClick?: (appointment: CalendarAppointment) => void;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; dotClass: string; borderAccentClass: string }
> = {
  CONFIRMED: {
    label: "Confirmado",
    dotClass: "bg-primary",
    borderAccentClass: "border-l-primary",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    dotClass: "bg-info",
    borderAccentClass: "border-l-info",
  },
  SCHEDULED: {
    label: "Agendado",
    dotClass: "bg-warning",
    borderAccentClass: "border-l-warning",
  },
  COMPLETED: {
    label: "Concluído",
    dotClass: "bg-muted-foreground/50",
    borderAccentClass: "border-l-muted-foreground/40",
  },
  CANCELLED: {
    label: "Cancelado",
    dotClass: "bg-destructive",
    borderAccentClass: "border-l-destructive",
  },
  BLOCKED: {
    label: "Bloqueio",
    dotClass: "bg-muted-foreground/70",
    borderAccentClass: "border-l-muted-foreground/60",
  },
};

export function CalendarEvent({
  appointment,
  startHour = 0,
  onClick,
}: CalendarEventProps) {
  const top = timeToPixels(appointment.startTime, startHour);
  const height = Math.max(durationToPixels(appointment.durationMinutes) - 2, 28);
  const isShort = height <= 36; // 30 minutos
  const isMedium = height > 36 && height < 68; // 45m a 60m
  const isLong = height >= 68; // 90m a 120m+
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
        "absolute inset-x-1.5 sm:inset-x-2 rounded-xs border border-white/[0.04] text-left transition-colors duration-150 cursor-pointer overflow-hidden select-none z-10",
        // Acento lateral discreto de status substituindo a borda pesada tradicional
        "border-l-[2.5px]",
        statusInfo.borderAccentClass,
        // Superfície tonal suave integrada ao grid
        isBlocked
          ? "bg-[#121212] opacity-75 hover:bg-[#161616]"
          : "bg-[#151515] hover:bg-[#1A1A1A] hover:border-white/[0.08]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
      )}
      role="button"
      tabIndex={0}
      title={`${appointment.clientName} · ${appointment.serviceName} (${appointment.startTime} - ${appointment.endTime})`}
    >
      {/* Caso 1: Evento Curto (30 minutos) - Disposição horizontal inline limpa */}
      {isShort && (
        <div className="flex items-center justify-between gap-1.5 h-full px-2 py-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-[10px] text-muted-foreground/75 shrink-0">
              {appointment.startTime}
            </span>
            <span className="text-[11px] font-medium text-foreground truncate">
              {appointment.clientName}
            </span>
          </div>
          <span className="font-mono text-[9px] text-muted-foreground/45 shrink-0 hidden sm:inline">
            30m
          </span>
        </div>
      )}

      {/* Caso 2: Evento Médio (45m a 60m) */}
      {isMedium && (
        <div className="flex flex-col justify-between h-full px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="text-[11px] sm:text-xs font-semibold text-foreground tracking-tight truncate">
              {appointment.clientName}
            </h4>
            <span className="font-mono text-[10px] text-muted-foreground/60 shrink-0">
              {appointment.startTime}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/70 truncate">
            {appointment.serviceName}
          </p>
        </div>
      )}

      {/* Caso 3: Evento Longo (90m a 120m+) - Amplo, arejado e com hierarquia completa */}
      {isLong && (
        <div className="flex flex-col justify-between h-full px-2.5 py-2">
          <div className="space-y-0.5">
            {/* Linha técnica com horário mono */}
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
              <span>{appointment.startTime} - {appointment.endTime}</span>
              <span className="text-muted-foreground/45">{appointment.durationMinutes}m</span>
            </div>

            {/* Título Principal do Cliente */}
            <h4 className="text-xs font-semibold text-foreground tracking-tight line-clamp-1 pt-0.5">
              {appointment.clientName}
            </h4>

            {/* Serviço / Descrição */}
            <p className="text-[11px] text-muted-foreground/75 line-clamp-1">
              {appointment.serviceName}
            </p>
          </div>

          {/* Rodapé: Técnico ou status com notas */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/50 pt-1">
            <span className="truncate">
              {appointment.technicianName || statusInfo.label}
            </span>
            {isBlocked && (
              <Lock className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
