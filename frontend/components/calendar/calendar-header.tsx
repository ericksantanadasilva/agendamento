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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-border/50 select-none">
      <div className="space-y-0.5">
        <span className="text-3xs font-mono uppercase tracking-widest text-muted-foreground/60 block">
          Gestão Operacional de Recursos
        </span>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Calendário
          </h1>
          <span className="text-xs sm:text-sm font-normal text-muted-foreground/75 tracking-normal">
            · {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="primary"
          size="md"
          onClick={onNewAppointment}
          className="font-medium shadow-xs text-xs px-3.5 h-8 sm:h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Novo agendamento</span>
        </Button>
      </div>
    </div>
  );
}
