import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import type {JwtPayload } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { isWithinAvailability } from './availability-coverage';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(actor: JwtPayload, dto: CreateAppointmentDto) {
        const userId = await this.resolveOwnerId(actor, dto.userId);

        const studio = await this.prisma.studio.findUnique({
            where: { id: dto.studioId },
        });
        if (!studio || !studio.active) {
            throw new NotFoundException('Estudio não encontrado');
        }

        const duration = await this.prisma.duration.findUnique({
            where: { id: dto.durationId },
        });
        if (!duration || !duration.active) {
            throw new NotFoundException('Duração não encontrada');
        }

        const startAt = new Date(dto.startAt);
        const endAt = new Date(startAt.getTime() + duration.minutes * 60_000);

        if (startAt <= new Date()) {
            throw new BadRequestException('O horário precisa estar no futuro');
        }

        const periods = await this.prisma.availability.findMany({
            where: { studioId: dto.studioId, active: true },
        });
        if (!isWithinAvailability(startAt, endAt, periods)) {
            throw new BadRequestException('O estúdio não está aberto neste horário');
        }

        return this.prisma.appointment.create({
            data: {
                userId,
                studioId: dto.studioId,
                durationId: dto.durationId,
                startAt,
                endAt,
            },
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
            throw new NotFoundException('Usuário não encontrado')
        }
        return user.id;
    }
}
