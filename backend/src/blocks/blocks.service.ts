import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';

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

    return this.prisma.block.create({
      data: {
        studioId: dto.studioId,
        createdById: userId,
        startAt,
        endAt,
        reason: dto.reason,
      },
    });
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
