import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import type { JwtPayload } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { isWithinAvailability } from './availability-coverage';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

const USER_EDIT_WINDOW_MS = 5 * 60_000;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: JwtPayload, dto: CreateAppointmentDto) {
    const userId = await this.resolveOwnerId(actor, dto.userId);

    const studio = await this.prisma.studio.findUnique({
      where: { id: dto.studioId },
    });
    if (!studio || !studio.active) {
      throw new NotFoundException('Estúdio não encontrado');
    }

    const duration = await this.prisma.duration.findUnique({
      where: { id: dto.durationId },
    });
    if (!duration || !duration.active) {
      throw new NotFoundException('Duração não encontrada');
    }

    const startAt = new Date(dto.startAt);
    const endAt = new Date(startAt.getTime() + duration.minutes * 60_000);

    await this.assertSlotAvailable(dto.studioId, startAt, endAt);

    return this.prisma.appointment.create({
      data: {
        userId,
        studioId: dto.studioId,
        durationId: dto.durationId,
        startAt,
        endAt,
        service: dto.service,
      },
    });
  }

  async cancel(actor: JwtPayload, id: string, dto: CancelAppointmentDto) {
    await this.findModifiable(actor, id);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELED,
        canceledReason: dto.reason,
      },
    });
  }

  async update(actor: JwtPayload, id: string, dto: UpdateAppointmentDto) {
    if (!dto.studioId && !dto.durationId && !dto.startAt && !dto.service) {
      throw new BadRequestException('Informe ao menos um campo para alterar');
    }

    const current = await this.findModifiable(actor, id);

    const studioId = dto.studioId ?? current.studioId;
    const durationId = dto.durationId ?? current.durationId;
    const startAt = dto.startAt ? new Date(dto.startAt) : current.startAt;

    if (dto.studioId) {
      const studio = await this.prisma.studio.findUnique({
        where: { id: dto.studioId },
      });
      if (!studio || !studio.active) {
        throw new NotFoundException('Estúdio não encontrado');
      }
    }

    const duration = await this.prisma.duration.findUnique({
      where: { id: durationId },
    });
    if (!duration || (dto.durationId && !duration.active)) {
      throw new NotFoundException('Duração não encontrada');
    }

    const endAt = new Date(startAt.getTime() + duration.minutes * 60_000);

    if (dto.studioId || dto.durationId || dto.startAt) {
      await this.assertSlotAvailable(studioId, startAt, endAt, id);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { studioId, durationId, startAt, endAt, service: dto.service },
    });
  }

  private async resolveOwnerId(actor: JwtPayload, requestedUserId?: string) {
    if (actor.role === Role.USER) {
      if (requestedUserId && requestedUserId !== actor.sub) {
        throw new ForbiddenException(
          'Você só pode criar appointments para si mesmo',
        );
      }
      return actor.sub;
    }

    if (!requestedUserId) {
      return actor.sub;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: requestedUserId },
    });
    if (!user || !user.active) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user.id;
  }

  private async assertNoConflicts(
    studioId: string,
    startAt: Date,
    endAt: Date,
    ignoreAppointmentId?: string,
  ) {
    const block = await this.prisma.block.findFirst({
      where: {
        studioId,
        active: true,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });
    if (block) {
      throw new ConflictException('O estúdio está bloqueado neste horário');
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        studioId,
        status: AppointmentStatus.SCHEDULED,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(ignoreAppointmentId ? { id: { not: ignoreAppointmentId } } : {}),
      },
    });
    if (appointment) {
      throw new ConflictException('Já existe agendamento neste horário');
    }
  }

  private async assertSlotAvailable(
    studioId: string,
    startAt: Date,
    endAt: Date,
    ignoreAppointmentId?: string,
  ) {
    if (startAt <= new Date()) {
      throw new BadRequestException('O horário precisa estar no futuro');
    }

    const periods = await this.prisma.availability.findMany({
      where: { studioId, active: true },
    });
    if (!isWithinAvailability(startAt, endAt, periods)) {
      throw new BadRequestException('O estúdio não está aberto neste horário');
    }
    await this.assertNoConflicts(studioId, startAt, endAt, ignoreAppointmentId);
  }

  private async findModifiable(actor: JwtPayload, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (actor.role === Role.USER) {
      if (appointment.userId !== actor.sub) {
        throw new ForbiddenException(
          'Você só pode alterar os seus próprios agendamentos',
        );
      }
      const age = Date.now() - appointment.createdAt.getTime();
      if (age > USER_EDIT_WINDOW_MS) {
        throw new ForbiddenException(
          'O prazo de 5 minutos para alterar este agendamento já passou',
        );
      }
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new ConflictException('Este agendamento já foi cancelado');
    }

    if (appointment.startAt <= new Date()) {
      throw new ConflictException(
        'Este agendamento já começou e não pode mais ser alterado',
      );
    }

    return appointment;
  }
}
