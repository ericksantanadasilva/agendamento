import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';

@Injectable()
export class StudiosService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: CreateStudioDto) {
        return this.prisma.studio.create({
            data: { name: dto.name, description: dto.description },
        });
    }

    findAll(onlyActive: boolean) {
        return this.prisma.studio.findMany({
            where: onlyActive ? { active: true } : undefined,
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string, onlyActive: boolean) {
        const studio = await this.prisma.studio.findUnique({ where: { id } });
        if (!studio || (onlyActive && !studio.active)) {
            throw new NotFoundException('Estudio não encontrado');
        }
        return studio;
    }

    async update(id: string, dto: UpdateStudioDto) {
        await this.findOne(id, false);

        return this.prisma.studio.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                active: dto.active,
            },
        });
    }
}
