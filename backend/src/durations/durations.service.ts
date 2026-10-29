import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDurationDto } from './dto/create-duration.dto';
import { UpdateDurationDto } from './dto/update-duration.dto';

@Injectable()
export class DurationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateDurationDto) {
    return this.prisma.duration.create({
      data: { name: dto.name, minutes: dto.minutes },
    });
  }

  findAll(onlyActive: boolean) {
    return this.prisma.duration.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: { minutes: 'asc' },
    });
  }

  async findOne(id: string, onlyActive: boolean) {
    const duration = await this.prisma.duration.findUnique({ where: { id } });
    if (!duration || (onlyActive && !duration.active)) {
      throw new NotFoundException('Duração não encontrada');
    }
    return duration;
  }

  async update(id: string, dto: UpdateDurationDto) {
    await this.findOne(id, false);

    return this.prisma.duration.update({
      where: { id },
      data: {
        name: dto.name,
        minutes: dto.minutes,
        active: dto.active,
      },
    });
  }
}
