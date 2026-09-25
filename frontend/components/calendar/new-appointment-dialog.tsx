"use client";

import * as React from "react";
import { StudioResource, CalendarAppointment, AppointmentStatus } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Clock, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NewAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resources: StudioResource[];
  selectedDate: Date;
  initialData?: CalendarAppointment | null;
  onSave: (appointment: Omit<CalendarAppointment, "id">, id?: string) => void;
  onDelete?: (appointmentId: string) => void;
}

function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  return Math.max(endTotal - startTotal, 0);
}

function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function NewAppointmentDialog({
  isOpen,
  onClose,
  resources,
  selectedDate,
  initialData,
  onSave,
  onDelete,
}: NewAppointmentDialogProps) {
  const isEditing = Boolean(initialData);

  // Estados do formulário
  const [clientName, setClientName] = React.useState("");
  const [serviceName, setServiceName] = React.useState("");
  const [resourceId, setResourceId] = React.useState(resources[0]?.id || "");
  const [dateStr, setDateStr] = React.useState(() => formatDateToIso(selectedDate));
  const [startTime, setStartTime] = React.useState("10:00");
  const [endTime, setEndTime] = React.useState("11:30");
  const [technicianName, setTechnicianName] = React.useState("");
  const [status, setStatus] = React.useState<AppointmentStatus>("CONFIRMED");
  const [notes, setNotes] = React.useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  // Erros de validação
  const [errors, setErrors] = React.useState<{
    clientName?: string;
    serviceName?: string;
    time?: string;
  }>({});

  // Sincroniza os dados iniciais quando abrir o dialog
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setClientName(initialData.clientName);
        setServiceName(initialData.serviceName);
        setResourceId(initialData.resourceId);
        setDateStr(initialData.date);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setTechnicianName(initialData.technicianName || "");
        setStatus(initialData.status);
        setNotes(initialData.notes || "");
      } else {
        setClientName("");
        setServiceName("");
        setResourceId(resources[0]?.id || "");
        setDateStr(formatDateToIso(selectedDate));
        setStartTime("10:00");
        setEndTime("11:30");
        setTechnicianName("");
        setStatus("CONFIRMED");
        setNotes("");
      }
      setIsConfirmingDelete(false);
      setErrors({});
    }
  }, [isOpen, initialData, selectedDate, resources]);

  // Fecha ao pressionar ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const durationMinutes = React.useMemo(() => {
    return calculateDuration(startTime, endTime);
  }, [startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!clientName.trim()) {
      newErrors.clientName = "Informe o nome do cliente ou projeto";
    }

    if (!serviceName.trim()) {
      newErrors.serviceName = "Informe o tipo de serviço";
    }

    if (durationMinutes <= 0) {
      newErrors.time = "O horário de término deve ser posterior ao de início";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Salva ou atualiza o agendamento
    onSave(
      {
        clientName: clientName.trim(),
        serviceName: serviceName.trim(),
        resourceId,
        date: dateStr,
        startTime,
        endTime,
        durationMinutes,
        technicianName: technicianName.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      },
      initialData?.id,
    );

    // Limpa os campos e fecha
    setClientName("");
    setServiceName("");
    setTechnicianName("");
    setNotes("");
    setErrors({});
    onClose();
  };

  const handleDelete = () => {
    if (!initialData || !onDelete) return;

    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    onDelete(initialData.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-[var(--radius)] shadow-xl shadow-black/40 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-appointment-title"
      >
        {/* Cabeçalho do Dialog */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="space-y-0.5">
            <span className="font-mono text-3xs uppercase text-muted-foreground tracking-wider">
              {isEditing ? "Gestão de Agendamento" : "Operação de Recursos"}
            </span>
            <h2 id="new-appointment-title" className="text-sm sm:text-base font-semibold text-foreground">
              {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
            </h2>
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

        {/* Formulário com Scroll Interno se necessário */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-5 space-y-4 text-xs">
            {/* Cliente e Serviço */}
            <div className="space-y-3">
              <Input
                label="Cliente / Projeto *"
                placeholder="Ex: Banda Aurora, João Silva, Produtora..."
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: undefined }));
                }}
                error={errors.clientName}
                autoFocus
              />

              <Input
                label="Serviço *"
                placeholder="Ex: Gravação Acústica, Mixagem Dolby Atmos, Podcast..."
                value={serviceName}
                onChange={(e) => {
                  setServiceName(e.target.value);
                  if (errors.serviceName) setErrors((prev) => ({ ...prev, serviceName: undefined }));
                }}
                error={errors.serviceName}
              />
            </div>

            {/* Recurso / Estúdio */}
            <div className="space-y-1.5">
              <label htmlFor="resource-select" className="block text-xs font-medium text-muted-foreground select-none">
                Estúdio / Recurso *
              </label>
              <div className="relative">
                <select
                  id="resource-select"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="flex h-9 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs sm:text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer"
                >
                  {resources.map((res) => (
                    <option key={res.id} value={res.id} className="bg-card text-foreground">
                      {res.name} {res.subtitle ? `· ${res.subtitle}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Data e Horários */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <label htmlFor="date-input" className="block text-xs font-medium text-muted-foreground select-none">
                    Data *
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="flex h-9 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="start-time" className="block text-xs font-medium text-muted-foreground select-none">
                    Início *
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                    }}
                    className="flex h-9 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="end-time" className="block text-xs font-medium text-muted-foreground select-none">
                    Término *
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
                    }}
                    className="flex h-9 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer"
                  />
                </div>
              </div>

              {errors.time ? (
                <p className="text-2xs text-destructive mt-1 font-medium">{errors.time}</p>
              ) : (
                <div className="flex items-center gap-1.5 pt-1 text-2xs text-muted-foreground">
                  <Clock className="w-3 h-3 text-primary/70 shrink-0" />
                  <span>
                    Duração calculada: <strong className="text-foreground font-mono">{durationMinutes} min</strong> ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60 > 0 ? `${durationMinutes % 60}m` : ""})
                  </span>
                </div>
              )}
            </div>

            {/* Técnico / Responsável e Status Inicial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Técnico / Responsável"
                placeholder="Ex: Carlos M."
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
              />

              <div className="space-y-1.5">
                <label htmlFor="status-select" className="block text-xs font-medium text-muted-foreground select-none">
                  Status
                </label>
                <select
                  id="status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="flex h-9 w-full rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-xs sm:text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary cursor-pointer"
                >
                  <option value="CONFIRMED" className="bg-card text-foreground">Confirmado</option>
                  <option value="SCHEDULED" className="bg-card text-foreground">Agendado</option>
                  <option value="IN_PROGRESS" className="bg-card text-foreground">Em andamento</option>
                  <option value="BLOCKED" className="bg-card text-foreground">Bloqueio / Manutenção</option>
                </select>
              </div>
            </div>

            {/* Observações Técnicas */}
            <div className="space-y-1.5">
              <label htmlFor="notes-textarea" className="block text-xs font-medium text-muted-foreground select-none">
                Observações Técnicas (opcional)
              </label>
              <textarea
                id="notes-textarea"
                rows={3}
                placeholder="Requisitos de microfonação, número de canais, instrumentos ou equipamentos solicitados..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary resize-none"
              />
            </div>
          </div>

          {/* Rodapé com Ações */}
          <div className="flex items-center justify-between gap-2.5 p-4 border-t border-border bg-muted/20 mt-auto">
            <div>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isConfirmingDelete ? "Confirmar exclusão?" : "Excluir"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {isEditing ? "Salvar Alterações" : "Salvar Agendamento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
