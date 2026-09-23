"use client";

import * as React from "react";
import {
  minutesToPixels,
  DEFAULT_START_HOUR,
  DEFAULT_END_HOUR,
} from "./utils";

export interface CurrentTimeIndicatorProps {
  showLabel?: boolean;
  startHour?: number;
  endHour?: number;
}

export function CurrentTimeIndicator({
  showLabel = true,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
}: CurrentTimeIndicatorProps) {
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

  // Se o horário atual estiver fora do expediente exibido, não desenha
  if (currentMinutes < startHour * 60 || currentMinutes > endHour * 60) {
    return null;
  }

  const topPosition = minutesToPixels(currentMinutes, startHour);

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center transition-all duration-300 ease-linear"
      style={{ top: `${topPosition}px` }}
      aria-label={`Horário atual: ${currentTimeLabel}`}
    >
      {/* Marcador lateral discreto */}
      {showLabel ? (
        <div className="flex items-center absolute -left-1 sm:-left-2 -translate-y-1/2 bg-[#0d0d0d] px-1 py-0.5 rounded-xs border border-primary/30">
          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
          <span className="ml-1 text-primary/90 font-mono text-[9px] font-medium tracking-tight select-none leading-none">
            {currentTimeLabel}
          </span>
        </div>
      ) : (
        <span className="w-1 h-1 rounded-full bg-primary absolute -left-0.5 -translate-y-1/2" />
      )}

      {/* Linha horizontal fina de sinal visual discreto (1px, opacidade moderada) */}
      <div className="w-full h-[1px] bg-primary/45" />
    </div>
  );
}
