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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPreviousDay}
            title="Dia anterior"
            className="p-1 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToday}
            className={cn(
              "px-2.5 py-1 text-xs rounded-[var(--radius)] transition-colors cursor-pointer border",
              isCurrentDayToday
                ? "bg-muted/90 text-foreground font-medium border-border/80"
                : "bg-transparent text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/40",
            )}
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={onNextDay}
            title="Próximo dia"
            className="p-1 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador de Data Reduzida / Rótulo de Apoio */}
        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground/70 font-mono text-2xs">
          <CalendarIcon className="w-3.5 h-3.5 text-primary/80 shrink-0" />
          <span>
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(selectedDate)}
          </span>
        </div>
      </div>

      {/* Seletor de Modo de Visualização (Integrado, sem molduras pesadas) */}
      <div className="flex items-center gap-1 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onViewModeChange?.("day")}
          className={cn(
            "px-2.5 py-1 text-xs rounded-[var(--radius)] transition-colors cursor-pointer",
            viewMode === "day"
              ? "bg-muted text-foreground font-medium"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30",
          )}
        >
          Dia
        </button>

        <button
          type="button"
          disabled
          title="Modo Semana (planejado para próximas fases)"
          className="px-2.5 py-1 text-xs text-muted-foreground/30 cursor-not-allowed"
        >
          Semana
        </button>

        <button
          type="button"
          disabled
          title="Modo Mês (planejado para próximas fases)"
          className="px-2.5 py-1 text-xs text-muted-foreground/30 cursor-not-allowed"
        >
          Mês
        </button>
      </div>
    </div>
  );
}
