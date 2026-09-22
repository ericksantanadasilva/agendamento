"use client";

import * as React from "react";
import { getDayHours, HOUR_HEIGHT, TOTAL_DAY_HEIGHT } from "./utils";
import { cn } from "@/lib/utils";

export function TimeColumn() {
  const hours = React.useMemo(() => getDayHours(), []);

  return (
    <div className="sticky left-0 z-30 bg-card border-r border-border w-12 sm:w-16 shrink-0 select-none flex flex-col">
      {/* Cabeçalho de alinhamento com a barra de estúdios */}
      <div className="sticky top-0 z-40 bg-card border-b border-border h-14 flex items-center justify-center">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
          GMT-3
        </span>
      </div>

      {/* Grade de 24 Horas com Horários */}
      <div
        className="relative w-full"
        style={{ height: `${TOTAL_DAY_HEIGHT}px` }}
      >
        {hours.map(({ hour, label }) => {
          const top = hour * HOUR_HEIGHT;

          return (
            <div
              key={hour}
              style={{ top: `${top}px` }}
              className={cn(
                "absolute inset-x-0 flex items-start justify-end pr-2 sm:pr-3 pointer-events-none",
                hour === 0 ? "pt-1.5" : "-translate-y-2",
              )}
            >
              <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground/80 tracking-tight leading-none">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
