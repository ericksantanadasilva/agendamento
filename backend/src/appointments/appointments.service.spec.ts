import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import type { JwtPayload } from '../auth/auth.guard';
import type { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from './appointments.service';
import { isWithinAvailability } from './availability-coverage';
import type { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import type { CreateAppointmentDto } from './dto/create-appointment.dto';
import type { UpdateAppointmentDto } from './dto/update-appointment.dto';

// A regra "cabe no horário de funcionamento" tem testes próprios
// (availability-coverage.spec.ts). Aqui ela é controlada à mão.
jest.mock('./availability-coverage');
const isWithinAvailabilityMock = jest.mocked(isWithinAvailability);

const MINUTE = 60_000;
// "Agora" fixo em todos os testes: 29/10/2026, 12:00 em São Paulo.
const NOW = new Date('2026-10-29T15:00:00.000Z');
const START = '2026-10-30T13:00:00.000Z';
const END_AFTER_60_MIN = '2026-10-30T14:00:00.000Z';

const admin = { sub: 'admin-1', role: Role.ADMIN } as JwtPayload;
const operator = { sub: 'operator-1', role: Role.OPERATOR } as JwtPayload;
const user = { sub: 'user-1', role: Role.USER } as JwtPayload;

function createPrismaMock() {
  return {
    studio: { findUnique: jest.fn() },
    duration: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    block: { findFirst: jest.fn() },
    availability: { findMany: jest.fn() },
    appointment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

function makeAppointment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'apt-1',
    userId: 'user-1',
    studioId: 'studio-1',
    durationId: 'duration-1',
    startAt: new Date(START),
    endAt: new Date(END_AFTER_60_MIN),
    status: AppointmentStatus.SCHEDULED,
    createdAt: new Date(NOW.getTime() - MINUTE),
    ...overrides,
  };
}

describe('AppointmentsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: AppointmentsService;

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    prisma = createPrismaMock();
    service = new AppointmentsService(prisma as unknown as PrismaService);

    // Cenário padrão: tudo existe, está livre e o estúdio está aberto.
    prisma.studio.findUnique.mockResolvedValue({
      id: 'studio-1',
      active: true,
    });
    prisma.duration.findUnique.mockResolvedValue({
      id: 'duration-1',
      minutes: 60,
      active: true,
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2', active: true });
    prisma.availability.findMany.mockResolvedValue([]);
    prisma.block.findFirst.mockResolvedValue(null);
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.appointment.create.mockResolvedValue({ id: 'apt-1' });
    prisma.appointment.update.mockResolvedValue({ id: 'apt-1' });
    isWithinAvailabilityMock.mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe('create', () => {
    const dto = {
      studioId: 'studio-1',
      durationId: 'duration-1',
      startAt: START,
      service: 'Gravação da aula 12',
    } as CreateAppointmentDto;

    it('calcula o fim pela duração e grava para o próprio usuário', async () => {
      await service.create(user, dto);

      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          studioId: 'studio-1',
          durationId: 'duration-1',
          startAt: new Date(START),
          endAt: new Date(END_AFTER_60_MIN),
          service: 'Gravação da aula 12',
        },
      });
    });

    it('recusa o usuário comum reservando em nome de outra pessoa', async () => {
      await expect(
        service.create(user, { ...dto, userId: 'user-2' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('deixa a equipe reservar em nome de outro usuário ativo', async () => {
      await service.create(operator, { ...dto, userId: 'user-2' });

      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'user-2' }),
      });
    });

    it('reserva para a própria equipe quando não informa o usuário', async () => {
      await service.create(operator, dto);

      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'operator-1' }),
      });
    });

    it('recusa reservar para um usuário desativado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-2', active: false });

      await expect(
        service.create(admin, { ...dto, userId: 'user-2' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('recusa estúdio desativado', async () => {
      prisma.studio.findUnique.mockResolvedValue({
        id: 'studio-1',
        active: false,
      });

      await expect(service.create(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('recusa duração desativada', async () => {
      prisma.duration.findUnique.mockResolvedValue({
        id: 'duration-1',
        minutes: 60,
        active: false,
      });

      await expect(service.create(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('recusa horário que já passou', async () => {
      await expect(
        service.create(user, { ...dto, startAt: '2026-10-29T14:00:00.000Z' }),
      ).rejects.toThrow('O horário precisa estar no futuro');
    });

    it('recusa horário igual ao momento atual', async () => {
      await expect(
        service.create(user, { ...dto, startAt: NOW.toISOString() }),
      ).rejects.toThrow('O horário precisa estar no futuro');
    });

    it('recusa fora do horário de funcionamento', async () => {
      isWithinAvailabilityMock.mockReturnValue(false);

      await expect(service.create(user, dto)).rejects.toThrow(
        'O estúdio não está aberto neste horário',
      );
    });

    it('recusa quando há um bloqueio ativo no período', async () => {
      prisma.block.findFirst.mockResolvedValue({ id: 'block-1' });

      await expect(service.create(user, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('recusa quando já existe outra reserva no período', async () => {
      prisma.appointment.findFirst.mockResolvedValue({ id: 'other' });

      await expect(service.create(user, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('consulta conflitos por sobreposição estrita (reservas encostadas passam)', async () => {
      await service.create(user, dto);

      const startAt = new Date(START);
      const endAt = new Date(END_AFTER_60_MIN);
      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: {
          studioId: 'studio-1',
          status: AppointmentStatus.SCHEDULED,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prisma.appointment.findUnique.mockResolvedValue(makeAppointment());
    });

    it('recusa quando nenhum campo é informado', async () => {
      await expect(
        service.update(user, 'apt-1', {} as UpdateAppointmentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('alterar só o serviço não revalida o horário', async () => {
      await service.update(user, 'apt-1', {
        service: 'Novo serviço',
      } as UpdateAppointmentDto);

      expect(prisma.availability.findMany).not.toHaveBeenCalled();
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-1' },
        data: expect.objectContaining({ service: 'Novo serviço' }),
      });
    });

    it('mudar o horário revalida e ignora a própria reserva nos conflitos', async () => {
      await service.update(user, 'apt-1', {
        startAt: '2026-10-30T15:00:00.000Z',
      } as UpdateAppointmentDto);

      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: { not: 'apt-1' } }),
      });
    });

    it('recalcula o fim ao trocar de duração', async () => {
      prisma.duration.findUnique.mockResolvedValue({
        id: 'duration-2',
        minutes: 30,
        active: true,
      });

      await service.update(user, 'apt-1', {
        durationId: 'duration-2',
      } as UpdateAppointmentDto);

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-1' },
        data: expect.objectContaining({
          durationId: 'duration-2',
          endAt: new Date('2026-10-30T13:30:00.000Z'),
        }),
      });
    });

    it('usa a mesma regra dos 5 minutos do cancelamento', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({ createdAt: new Date(NOW.getTime() - 6 * MINUTE) }),
      );

      await expect(
        service.update(user, 'apt-1', {
          service: 'Novo',
        } as UpdateAppointmentDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancel', () => {
    const dto = { reason: 'Imprevisto' } as CancelAppointmentDto;

    it('grava o status cancelado e o motivo', async () => {
      prisma.appointment.findUnique.mockResolvedValue(makeAppointment());

      await service.cancel(user, 'apt-1', dto);

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-1' },
        data: {
          status: AppointmentStatus.CANCELED,
          canceledReason: 'Imprevisto',
        },
      });
    });

    it('recusa reserva inexistente', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.cancel(user, 'apt-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('recusa o usuário comum cancelando a reserva de outra pessoa', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({ userId: 'user-2' }),
      );

      await expect(service.cancel(user, 'apt-1', dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('recusa o usuário comum depois de 5 minutos', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({
          createdAt: new Date(NOW.getTime() - 5 * MINUTE - 1000),
        }),
      );

      await expect(service.cancel(user, 'apt-1', dto)).rejects.toThrow(
        'O prazo de 5 minutos',
      );
    });

    it('aceita o usuário comum nos 5 minutos exatos', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({ createdAt: new Date(NOW.getTime() - 5 * MINUTE) }),
      );

      await expect(service.cancel(user, 'apt-1', dto)).resolves.toBeDefined();
    });

    it('deixa a equipe cancelar depois dos 5 minutos', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({ createdAt: new Date(NOW.getTime() - 60 * MINUTE) }),
      );

      await expect(
        service.cancel(operator, 'apt-1', dto),
      ).resolves.toBeDefined();
    });

    it('recusa reserva que já foi cancelada, até para o administrador', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({ status: AppointmentStatus.CANCELED }),
      );

      await expect(service.cancel(admin, 'apt-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('recusa reserva que já começou, até para o administrador', async () => {
      prisma.appointment.findUnique.mockResolvedValue(
        makeAppointment({ startAt: new Date(NOW.getTime() - MINUTE) }),
      );

      await expect(service.cancel(admin, 'apt-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
