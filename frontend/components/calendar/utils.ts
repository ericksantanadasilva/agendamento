export const HOUR_HEIGHT = 64; // pixels por hora (aprox 1.066px por minuto)
export const TOTAL_HOURS = 24;
export const TOTAL_DAY_HEIGHT = HOUR_HEIGHT * TOTAL_HOURS; // 1536px

/**
 * Converte "HH:mm" para minutos decorridos desde 00:00
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converte minutos para posição Y em pixels
 */
export function minutesToPixels(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

/**
 * Retorna a posição vertical (top) em pixels para um horário "HH:mm"
 */
export function timeToPixels(timeStr: string): number {
  return minutesToPixels(timeToMinutes(timeStr));
}

/**
 * Retorna a altura em pixels para uma duração em minutos
 */
export function durationToPixels(durationMinutes: number): number {
  return (durationMinutes / 60) * HOUR_HEIGHT;
}

/**
 * Gera lista com as 24 horas do dia
 */
export function getDayHours(): { hour: number; label: string }[] {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${String(i).padStart(2, "0")}:00`,
  }));
}

/**
 * Formata data para cabeçalho: "Quinta-feira, 24 de setembro"
 */
export function formatHeaderDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);

  // Capitaliza o dia da semana
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${day} de ${month}`;
}

/**
 * Formata data em formato ISO simples: YYYY-MM-DD
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Verifica se duas datas correspondem ao mesmo dia
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
