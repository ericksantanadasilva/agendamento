"use client";

import * as React from "react";
import { CalendarAppointment, AppointmentStatus } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { X, Clock, Calendar, User, MapPin, FileText, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; dotClass: string }
> = {
  CONFIRMED: {
    label: "Confirmado",
    dotClass: "bg-primary",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    dotClass: "bg-info",
  },
  SCHEDULED: {
    label: "Agendado",
    dotClass: "bg-warning",
  },
  COMPLETED: {
    label: "Concluído",
    dotClass: "bg-muted-foreground/50",
  },
  CANCELLED: {
    label: "Cancelado",
    dotClass: "bg-destructive",
  },
  BLOCKED: {
    label: "Bloqueado",
    dotClass: "bg-muted-foreground/70",
  },
};

export interface EventDetailsDialogProps {
  appointment: CalendarAppointment | null;
  resourceName?: string;
  onClose: () => void;
  onEdit?: (appointment: CalendarAppointment) => void;
  onDelete?: (appointmentId: string) => void;
}

export function EventDetailsDialog({
  appointment,
  resourceName,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsDialogProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    setIsConfirmingDelete(false);
  }, [appointment]);
  if (!appointment) return null;

  const statusInfo = STATUS_CONFIG[appointment.status] || {
    label: appointment.status,
    dotClass: "bg-muted-foreground",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-card border border-border rounded-[var(--radius)] shadow-xl shadow-black/40 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Cabeçalho do Dialog */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="space-y-0.5">
            <span className="font-mono text-3xs uppercase text-muted-foreground tracking-wider">
              Detalhes da Reserva
            </span>
            <h3 id="dialog-title" className="text-sm font-semibold text-foreground truncate">
              {appointment.clientName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Informações Estruturadas */}
        <div className="p-5 space-y-4 text-xs">
          {/* Serviço e Status */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
            <div>
              <p className="text-muted-foreground text-2xs">Serviço</p>
              <p className="font-medium text-foreground text-sm mt-0.5">
                {appointment.serviceName}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-2xs px-2.5 py-0.5 rounded bg-muted/60 border border-border/60 text-foreground">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusInfo.dotClass)} />
                <span className="font-medium">{statusInfo.label}</span>
              </span>
            </div>
          </div>

          {/* Horário & Duração */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded bg-muted/40 border border-border/60">
              <span className="flex items-center gap-1.5 text-muted-foreground text-3xs">
                <Clock className="w-3 h-3" />
                Horário
              </span>
              <p className="font-mono font-medium text-foreground mt-1">
                {appointment.startTime} → {appointment.endTime}
              </p>
              <p className="text-3xs font-mono text-muted-foreground mt-0.5">
                Duração: {appointment.durationMinutes} min
              </p>
            </div>

            <div className="p-2.5 rounded bg-muted/40 border border-border/60">
              <span className="flex items-center gap-1.5 text-muted-foreground text-3xs">
                <MapPin className="w-3 h-3" />
                Local / Recurso
              </span>
              <p className="font-medium text-foreground mt-1 truncate">
                {resourceName || "Estúdio Geral"}
              </p>
              <p className="text-3xs font-mono text-muted-foreground mt-0.5">
                {appointment.resourceId}
              </p>
            </div>
          </div>

          {/* Técnico / Responsável */}
          {appointment.technicianName && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-muted/20 border border-border/40">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <span className="text-3xs text-muted-foreground block">
                  Profissional Designado
                </span>
                <span className="font-medium text-foreground">
                  {appointment.technicianName}
                </span>
              </div>
            </div>
          )}

          {/* Observações Técnicas */}
          {appointment.notes && (
            <div className="space-y-1 pt-1">
              <span className="flex items-center gap-1.5 text-muted-foreground text-3xs">
                <FileText className="w-3 h-3" />
                Observações
              </span>
              <p className="text-2xs text-muted-foreground/90 bg-muted/30 p-2.5 rounded border border-border/40 leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between gap-2.5 p-3.5 border-t border-border bg-muted/20">
          <div>
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (!isConfirmingDelete) {
                    setIsConfirmingDelete(true);
                    return;
                  }
                  onDelete(appointment.id);
                  onClose();
                }}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isConfirmingDelete ? "Confirmar exclusão?" : "Excluir"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Fechar
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(appointment);
                  onClose();
                }}
                className="gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
