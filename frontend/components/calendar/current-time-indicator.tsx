'use client';

import * as React from 'react';
import { minutesToPixels, DEFAULT_START_HOUR, DEFAULT_END_HOUR } from './utils';

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
  const [mounted, setMounted] = React.useState(false);
  const [currentMinutes, setCurrentMinutes] = React.useState<number>(0);
  const [currentTimeLabel, setCurrentTimeLabel] = React.useState<string>('');

  React.useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
      setCurrentTimeLabel(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  // Se o horário atual estiver fora do expediente exibido, não desenha
  if (currentMinutes < startHour * 60 || currentMinutes > endHour * 60) {
    return null;
  }

  const topPosition = minutesToPixels(currentMinutes, startHour);

  return (
    <div
      className='absolute left-0 right-0 pointer-events-none flex items-center transition-all duration-300 ease-linear'
      style={{ top: `${topPosition}px` }}
      aria-label={`Horário atual: ${currentTimeLabel}`}
    >
      {/* Marcador lateral com horário atual em vermelho (sempre no topo do eixo temporal) */}
      {showLabel ? (
        <div className='flex items-center absolute -left-1 sm:-left-2 -translate-y-1/2 bg-background px-1 py-0.5 rounded-xs border border-destructive/40 z-[25]'>
          <span className='w-1.5 h-1.5 rounded-full bg-destructive shrink-0' />
          <span className='ml-1 text-destructive font-mono text-4xs font-medium tracking-tight select-none leading-none'>
            {currentTimeLabel}
          </span>
        </div>
      ) : (
        <span className='w-1.5 h-1.5 rounded-full bg-destructive absolute -left-0.5 -translate-y-1/2 z-[25]' />
      )}

      {/* Linha horizontal vermelha suave e plana, sem glow/neon (z-[1] < z-10 dos eventos) */}
      <div className='w-full h-[1px] bg-destructive/60 z-[1]' />
    </div>
  );
}
