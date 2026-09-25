export const HOUR_HEIGHT = 64; // pixels por hora (aprox 1.066px por minuto)
export const HEADER_HEIGHT = 56; // pixels da barra de cabeçalho dos estúdios (h-14)
export const DEFAULT_START_HOUR = 0;
export const DEFAULT_END_HOUR = 24;
export const TOTAL_HOURS = 24;
export const TOTAL_DAY_HEIGHT = HOUR_HEIGHT * TOTAL_HOURS; // 1536px (default 24h)

/**
 * Retorna a altura total do calendário com base na janela operacional configurada
 */
export function getCalendarHeight(startHour = DEFAULT_START_HOUR, endHour = DEFAULT_END_HOUR): number {
  return Math.max(endHour - startHour, 1) * HOUR_HEIGHT;
}

/**
 * Converte "HH:mm" para minutos decorridos desde 00:00
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converte minutos para posição Y em pixels, considerando o offset do horário inicial
 */
export function minutesToPixels(minutes: number, startHour = DEFAULT_START_HOUR): number {
  const adjustedMinutes = minutes - startHour * 60;
  return (adjustedMinutes / 60) * HOUR_HEIGHT;
}

/**
 * Retorna a posição vertical (top) em pixels para um horário "HH:mm", considerando o início operacional
 */
export function timeToPixels(timeStr: string, startHour = DEFAULT_START_HOUR): number {
  return minutesToPixels(timeToMinutes(timeStr), startHour);
}

/**
 * Retorna a altura em pixels para uma duração em minutos
 */
export function durationToPixels(durationMinutes: number): number {
  return (durationMinutes / 60) * HOUR_HEIGHT;
}

/**
 * Gera lista com as horas operacionais do dia
 */
export function getDayHours(
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
): { hour: number; label: string }[] {
  const count = Math.max(endHour - startHour, 1);
  return Array.from({ length: count }, (_, i) => {
    const actualHour = startHour + i;
    return {
      hour: actualHour,
      label: `${String(actualHour).padStart(2, "0")}:00`,
    };
  });
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

/**
 * Retorna os 7 dias da semana (Domingo a Sábado) contendo a data informada
 */
export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const diffToSunday = -day;
  const sunday = new Date(d);
  sunday.setDate(d.getDate() + diffToSunday);
  sunday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const nextDay = new Date(sunday);
    nextDay.setDate(sunday.getDate() + i);
    return nextDay;
  });
}

/**
 * Formata o intervalo da semana para exibição na toolbar/header
 * Ex: "21 a 27 de set, 2026"
 */
export function formatWeekRange(date: Date): string {
  const week = getWeekDates(date);
  const first = week[0];
  const last = week[6];

  const firstDay = first.getDate();
  const lastDay = last.getDate();
  const firstMonth = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(first)
    .replace(".", "");
  const lastMonth = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(last)
    .replace(".", "");
  const year = last.getFullYear();

  if (first.getMonth() === last.getMonth()) {
    return `${firstDay} a ${lastDay} de ${lastMonth}, ${year}`;
  }
  return `${firstDay} de ${firstMonth} a ${lastDay} de ${lastMonth}, ${year}`;
}

/**
 * Retorna a sigla abreviada do dia da semana (ex: SEG, TER, QUA)
 */
export function formatWeekDayShort(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  return weekday;
}

export interface EventLayoutPosition {
  colIndex: number;
  totalCols: number;
  leftPercent: number;
  widthPercent: number;
}

/**
 * Calcula posicionamento lateral para eventos sobrepostos em uma mesma coluna diária.
 * - Eventos no mesmo minuto (ex: um termina 12:00 e outro começa 12:00) NÃO colidem.
 * - Cada evento utiliza o espaço disponível com base em quem REALMENTE está concorrendo com ele.
 * - Garante a ordem visual estrita dos estúdios: E1 (esquerda) -> E2 (meio) -> E3 (direita).
 */
export function computeOverlappingLayout<
  T extends { startTime: string; endTime: string; durationMinutes: number; id: string; resourceId?: string }
>(
  appointments: T[],
  resourceOrder: string[] = ["studio-1", "studio-2", "studio-3"],
): Map<string, EventLayoutPosition> {
  const result = new Map<string, EventLayoutPosition>();
  if (appointments.length === 0) return result;

  // 1. Mapeia quem REALMENTE colide no tempo com cada evento: max(startA, startB) < min(endA, endB)
  const collisionMap = new Map<string, T[]>();
  for (const a of appointments) {
    const startA = timeToMinutes(a.startTime);
    const endA = timeToMinutes(a.endTime);
    const colliding: T[] = [];

    for (const b of appointments) {
      if (a.id === b.id) continue;
      const startB = timeToMinutes(b.startTime);
      const endB = timeToMinutes(b.endTime);

      // Colisão real estrita (se endA === startB, ex: 12:00 e 12:00, NÃO colidem)
      if (Math.max(startA, startB) < Math.min(endA, endB)) {
        colliding.push(b);
      }
    }
    collisionMap.set(a.id, colliding);
  }

  // 2. Para cada evento, calcula as colunas ativas durante o seu período de vigência
  for (const apt of appointments) {
    const colliding = collisionMap.get(apt.id) || [];

    // Se não há concorrentes simultâneos durante a vigência deste evento, ocupa 100% da largura
    if (colliding.length === 0) {
      result.set(apt.id, {
        colIndex: 0,
        totalCols: 1,
        leftPercent: 0,
        widthPercent: 100,
      });
      continue;
    }

    // Grupo de eventos que ocorrem simultaneamente a este evento (ele mesmo + concorrentes diretos)
    const concurrentGroup = [apt, ...colliding];

    // Identifica quais estúdios estão competindo neste momento específico
    const activeResources = resourceOrder.filter((rId) =>
      concurrentGroup.some((item) => item.resourceId === rId),
    );

    // Fallback para IDs fora da lista oficial
    for (const item of concurrentGroup) {
      if (item.resourceId && !activeResources.includes(item.resourceId)) {
        activeResources.push(item.resourceId);
      }
    }

    const totalCols = Math.max(activeResources.length, 1);
    const colIndex = apt.resourceId ? Math.max(activeResources.indexOf(apt.resourceId), 0) : 0;

    const widthPercent = 100 / totalCols;
    const leftPercent = colIndex * widthPercent;

    result.set(apt.id, {
      colIndex,
      totalCols,
      leftPercent,
      widthPercent,
    });
  }

  return result;
}

export interface MonthDayInfo {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Retorna todos os dias (células da grade) que compõem o calendário do mês especificado.
 * Inclui dias do mês anterior e seguinte para completar as semanas de Domingo a Sábado (grade 7x5 ou 7x6).
 */
export function getMonthCalendarDays(date: Date): MonthDayInfo[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  // Primeiro dia do mês
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sáb
  const diffToSunday = -firstDayWeekday;

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() + diffToSunday);
  startDate.setHours(0, 0, 0, 0);

  // Último dia do mês
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const lastDayWeekday = lastDayOfMonth.getDay(); // 0 = Dom, ..., 6 = Sáb
  const diffToSaturday = 6 - lastDayWeekday;

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(lastDayOfMonth.getDate() + diffToSaturday);
  endDate.setHours(23, 59, 59, 999);

  // Gera dias entre startDate e endDate
  const days: MonthDayInfo[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayDate = new Date(current);
    days.push({
      date: dayDate,
      dateStr: toISODateString(dayDate),
      dayNumber: dayDate.getDate(),
      isCurrentMonth: dayDate.getMonth() === month,
      isToday: isSameDay(dayDate, today),
    });
    current.setDate(current.getDate() + 1);
  }

  // Se a grade tiver menos de 35 dias (5 semanas), completa para ficar uniforme
  while (days.length % 7 !== 0 || days.length < 35) {
    const nextDate = new Date(current);
    days.push({
      date: nextDate,
      dateStr: toISODateString(nextDate),
      dayNumber: nextDate.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(nextDate, today),
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Formata o mês e ano para exibição na toolbar/header: "Setembro de 2026"
 */
export function formatMonthRange(date: Date): string {
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalizedMonth} de ${date.getFullYear()}`;
}


