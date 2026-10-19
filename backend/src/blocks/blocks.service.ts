import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBlockDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (endAt <= startAt) {
      throw new BadRequestException(
        'A data final precisa ser maior que a inicial',
      );
    }

    const studio = await this.prisma.studio.findUnique({
      where: { id: dto.studioId },
    });
    if (!studio) {
      throw new NotFoundException('Estúdio não encontrado');
    }

    const conflicting = await this.prisma.appointment.findMany({
      where: {
        studioId: dto.studioId,
        status: AppointmentStatus.SCHEDULED,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startAt: 'asc' },
    });

    if (conflicting.length > 0 && !dto.cancelConflicting) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message:
          'Existem agendamentos neste horário. Envie cancelConflicting: true pra cancelá-los e criar o bloqueio.',
        appointments: conflicting,
      });
    }

    const data = {
      studioId: dto.studioId,
      createdById: userId,
      startAt,
      endAt,
      reason: dto.reason,
    };

    if (conflicting.length === 0) {
      return this.prisma.block.create({ data });
    }

    const canceledReason = dto.reason
      ? `Bloqueio do estúdio: ${dto.reason}`
      : 'Bloqueio do estúdio';

    const [, block] = await this.prisma.$transaction([
      this.prisma.appointment.updateMany({
        where: { id: { in: conflicting.map((a) => a.id) } },
        data: { status: AppointmentStatus.CANCELED, canceledReason },
      }),
      this.prisma.block.create({ data }),
    ]);

    return block;
  }

  findAll(studioId?: string) {
    return this.prisma.block.findMany({
      where: studioId ? { studioId } : undefined,
      orderBy: { startAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) {
      throw new NotFoundException('Bloqueio não encontrado');
    }
    return block;
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.block.update({
      where: { id },
      data: { active: false },
    });
  }
}
