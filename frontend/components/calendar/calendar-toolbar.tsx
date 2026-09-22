"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CalendarViewMode } from "@/types/calendar";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { isSameDay } from "./utils";
import { cn } from "@/lib/utils";

export interface CalendarToolbarProps {
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
}

export function CalendarToolbar({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onToday,
  viewMode = "day",
  onViewModeChange,
}: CalendarToolbarProps) {
  const isCurrentDayToday = React.useMemo(() => {
    return isSameDay(selectedDate, new Date());
  }, [selectedDate]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1 text-xs select-none">
      {/* Controles de Navegação Temporal (< Hoje >) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-[var(--radius)] border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={onPreviousDay}
            title="Dia anterior"
            className="p-1.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToday}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-[var(--radius)] transition-colors cursor-pointer",
              isCurrentDayToday
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={onNextDay}
            title="Próximo dia"
            className="p-1.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador de Data Reduzida / Rótulo de Apoio */}
        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground font-mono text-[11px] px-2">
          <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(selectedDate)}
          </span>
        </div>
      </div>

      {/* Seletor de Modo de Visualização (Dia [ativo], Semana, Mês) */}
      <div className="flex items-center self-start sm:self-auto rounded-[var(--radius)] border border-border bg-card p-0.5">
        <button
          type="button"
          onClick={() => onViewModeChange?.("day")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-[var(--radius)] transition-colors cursor-pointer",
            viewMode === "day"
              ? "bg-muted text-foreground font-semibold border-b border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Dia
        </button>

        <button
          type="button"
          disabled
          title="Modo Semana (planejado para próximas fases)"
          className="px-3 py-1 text-xs font-medium rounded-[var(--radius)] text-muted-foreground/40 cursor-not-allowed"
        >
          Semana
        </button>

        <button
          type="button"
          disabled
          title="Modo Mês (planejado para próximas fases)"
          className="px-3 py-1 text-xs font-medium rounded-[var(--radius)] text-muted-foreground/40 cursor-not-allowed"
        >
          Mês
        </button>
      </div>
    </div>
  );
}
