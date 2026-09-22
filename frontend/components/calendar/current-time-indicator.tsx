"use client";

import * as React from "react";
import { minutesToPixels } from "./utils";

export interface CurrentTimeIndicatorProps {
  showLabel?: boolean;
}

export function CurrentTimeIndicator({ showLabel = true }: CurrentTimeIndicatorProps) {
  const [currentMinutes, setCurrentMinutes] = React.useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  const [currentTimeLabel, setCurrentTimeLabel] = React.useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
      setCurrentTimeLabel(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  const topPosition = minutesToPixels(currentMinutes);

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center transition-all duration-300 ease-linear"
      style={{ top: `${topPosition}px` }}
      aria-label={`Horário atual: ${currentTimeLabel}`}
    >
      {/* Marcador lateral na borda da coluna */}
      {showLabel ? (
        <div className="flex items-center absolute -left-1 sm:-left-1.5 -translate-y-1/2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 shrink-0" />
          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-mono text-[10px] font-semibold leading-none shadow-xs select-none">
            {currentTimeLabel}
          </span>
        </div>
      ) : (
        <span className="w-2 h-2 rounded-full bg-primary absolute -left-1 -translate-y-1/2" />
      )}

      {/* Linha horizontal fina através de toda a largura do dia */}
      <div className="w-full h-[1.5px] bg-primary/70" />
    </div>
  );
}
