"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatHeaderDate } from "./utils";

export interface CalendarHeaderProps {
  selectedDate: Date;
  onNewAppointment?: () => void;
}

export function CalendarHeader({
  selectedDate,
  onNewAppointment,
}: CalendarHeaderProps) {
  const formattedDate = React.useMemo(() => {
    return formatHeaderDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/70 select-none">
      <div className="space-y-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          Gestão Operacional de Recursos
        </span>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Calendário
          </h1>
          <span className="text-sm sm:text-base font-medium text-muted-foreground tracking-tight">
            · {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="primary"
          size="md"
          onClick={onNewAppointment}
          className="font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4 mr-0.5" />
          <span>Novo agendamento</span>
        </Button>
      </div>
    </div>
  );
}
