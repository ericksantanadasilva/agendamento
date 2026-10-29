import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvailabilityDto) {
    this.assertValidRange(dto.startMinute, dto.endMinute);

    const studio = await this.prisma.studio.findUnique({
      where: { id: dto.studioId },
    });
    if (!studio) {
      throw new NotFoundException('Estúdio não encontrado');
    }

    await this.assertNoOverlap(
      dto.studioId,
      dto.dayOfWeek,
      dto.startMinute,
      dto.endMinute,
    );

    return this.prisma.availability.create({
      data: {
        studioId: dto.studioId,
        dayOfWeek: dto.dayOfWeek,
        startMinute: dto.startMinute,
        endMinute: dto.endMinute,
      },
    });
  }

  findAll(onlyActive: boolean, studioId?: string) {
    return this.prisma.availability.findMany({
      where: {
        ...(onlyActive ? { active: true } : {}),
        ...(studioId ? { studioId } : {}),
      },
      orderBy: [
        { studioId: 'asc' },
        { dayOfWeek: 'asc' },
        { startMinute: 'asc' },
      ],
    });
  }

  async findOne(id: string, onlyActive: boolean) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });
    if (!availability || (onlyActive && !availability.active)) {
      throw new NotFoundException('Horário não encontrado');
    }
    return availability;
  }

  async update(id: string, dto: UpdateAvailabilityDto) {
    const current = await this.findOne(id, false);

    const startMinute = dto.startMinute ?? current.startMinute;
    const endMinute = dto.endMinute ?? current.endMinute;
    const active = dto.active ?? current.active;

    this.assertValidRange(startMinute, endMinute);

    if (active) {
      await this.assertNoOverlap(
        current.studioId,
        current.dayOfWeek,
        startMinute,
        endMinute,
        id,
      );
    }

    return this.prisma.availability.update({
      where: { id },
      data: {
        startMinute: dto.startMinute,
        endMinute: dto.endMinute,
        active: dto.active,
      },
    });
  }

  private assertValidRange(startMinute: number, endMinute: number) {
    if (endMinute <= startMinute) {
      throw new BadRequestException(
        'O horário final precisa ser maior que o inicial',
      );
    }
  }

  private async assertNoOverlap(
    studioId: string,
    dayOfWeek: DayOfWeek,
    startMinute: number,
    endMinute: number,
    ignoreId?: string,
  ) {
    const conflict = await this.prisma.availability.findFirst({
      where: {
        studioId,
        dayOfWeek,
        active: true,
        startMinute: { lt: endMinute },
        endMinute: { gt: startMinute },
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
    });
    if (conflict) {
      throw new ConflictException(
        'Este período se sobrepõe a outro já cadastrado para o mesmo estúdio e dia',
      );
    }
  }
}
