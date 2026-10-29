import { DayOfWeek } from '@prisma/client';
import {
  AvailabilityPeriod,
  isWithinAvailability,
  splitByLocalDay,
} from './availability-coverage';

//Monta um Date a partir da hora "de parede" de São Paulo (UTC-3).
const sp = (date: string, time: string) => new Date(`${date}T${time}:00-03:00`);

// 2026-11-16 é segunda, 2026-11-20 é sexta e 2026-11-21 é sábado
const manhaETarde: AvailabilityPeriod[] = [
  { dayOfWeek: DayOfWeek.MONDAY, startMinute: 540, endMinute: 720 }, //9H-12H
  { dayOfWeek: DayOfWeek.MONDAY, startMinute: 720, endMinute: 1080 }, //12h-18h
];

describe('isWithinAvailability', () => {
  it('aceita horário dentro de um único periodo', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-16', '10:00'),
        sp('2026-11-16', '11:00'),
        manhaETarde,
      ),
    ).toBe(true);
  });

  it('aceita horario que atravessa dois periodos que se encostam', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-16', '11:00'),
        sp('2026-11-16', '13:00'),
        manhaETarde,
      ),
    ).toBe(true);
  });

  it('aceita o período inteiro, de ponta a ponta', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-16', '09:00'),
        sp('2026-11-16', '18:00'),
        manhaETarde,
      ),
    ).toBe(true);
  });

  it('recusa horário que começa antes da abertura', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-16', '08:00'),
        sp('2026-11-16', '10:00'),
        manhaETarde,
      ),
    ).toBe(false);
  });

  it('recusa horário que termina depois do fechamento', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-16', '17:00'),
        sp('2026-11-16', '19:00'),
        manhaETarde,
      ),
    ).toBe(false);
  });

  it('recusa horário que cai num buraco entre dois periodos', () => {
    const comAlmoço: AvailabilityPeriod[] = [
      { dayOfWeek: DayOfWeek.MONDAY, startMinute: 540, endMinute: 720 }, //9h-12h
      { dayOfWeek: DayOfWeek.MONDAY, startMinute: 780, endMinute: 1080 }, //13h-18h
    ];
    expect(
      isWithinAvailability(
        sp('2026-11-16', '11:00'),
        sp('2026-11-16', '14:00'),
        comAlmoço,
      ),
    ).toBe(false);
  });

  it('recusa dia da semana sem nenhum período', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-17', '10:00'),
        sp('2026-11-17', '11:00'),
        manhaETarde,
      ),
    ).toBe(false);
  });

  it('recusa quando o fim não é maior que o início', () => {
    expect(
      isWithinAvailability(
        sp('2026-11-16', '11:00'),
        sp('2026-11-16', '11:00'),
        manhaETarde,
      ),
    ).toBe(false);
  });

  describe('virada do dia', () => {
    const viradaSextaSabado: AvailabilityPeriod[] = [
      { dayOfWeek: DayOfWeek.FRIDAY, startMinute: 1320, endMinute: 1440 }, // 22h-24h
      { dayOfWeek: DayOfWeek.SATURDAY, startMinute: 0, endMinute: 120 }, // 0h-2h
    ];

    it('aceita quando os dois dias estão abertos e se encostam', () => {
      expect(
        isWithinAvailability(
          sp('2026-11-20', '23:00'),
          sp('2026-11-21', '01:00'),
          viradaSextaSabado,
        ),
      ).toBe(true);
    });

    it('recusa quando o dia seguinte não tem período', () => {
      const soSexta = viradaSextaSabado.slice(0, 1);
      expect(
        isWithinAvailability(
          sp('2026-11-20', '23:00'),
          sp('2026-11-21', '01:00'),
          soSexta,
        ),
      ).toBe(false);
    });
  });
});

describe('splitByLocalDay', () => {
  it('divide um horário que cruza a meia-noite em dois pedaços', () => {
    expect(
      splitByLocalDay(sp('2026-11-20', '23:00'), sp('2026-11-21', '01:00')),
    ).toEqual([
      { dayOfWeek: DayOfWeek.FRIDAY, startMinute: 1380, endMinute: 1440 },
      { dayOfWeek: DayOfWeek.SATURDAY, startMinute: 0, endMinute: 60 },
    ]);
  });

  it('usa a hora de São Paulo, e não a de UTC, para achar o dia', () => {
    // 02:00 UTC de terça é 23:00 de segunda em São Paulo.
    expect(
      splitByLocalDay(
        new Date('2026-11-17T02:00:00Z'),
        new Date('2026-11-17T02:30:00Z'),
      ),
    ).toEqual([
      { dayOfWeek: DayOfWeek.MONDAY, startMinute: 1380, endMinute: 1410 },
    ]);
  });
});
