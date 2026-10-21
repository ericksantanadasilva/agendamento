import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Role } from '@prisma/client';
import type { JwtPayload } from 'src/auth/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaQueryDto } from './dto/agenda-query.dto';

const MAX_RANGE_DAYS = 42;
const MAX_RANGE_MS = 31 * 24 * 60 * 60_000;

@Injectable()
export class AgendaService {
    constructor(private readonly prisma: PrismaService) {}

    async find(actor: JwtPayload, query: AgendaQueryDto) {
        const from = new Date(query.from);
        const to = new Date(query.to);

        if (to <= from) {
            throw new BadRequestException(
                'A data final precisa ser maior que a inicial',
            );
        }
        if (to.getTime() - from.getTime() > MAX_RANGE_MS) {
            throw new BadRequestException(`O intervalo máximo é de ${MAX_RANGE_DAYS} dias`);
        }

        const studio = await this.prisma.studio.findUnique({
            where: { id: query.studioId },
        });
        if (!studio || (actor.role !== Role.ADMIN && !studio.active)) {
            throw new NotFoundException('Estúdio não encontrado');
        }

        const appointments = await this.prisma.appointment.findMany({
            where: {
                studioId: query.studioId,
                status: AppointmentStatus.SCHEDULED,
                startAt: { lt: to },
                endAt: { gt: from },
            },
            select: {
                id: true,
                userId: true,
                startAt: true,
                endAt: true,
                createdAt: true,
                user: { select: { name: true } },
                duration: { select: { name: true } },
            },
        });

        const blocks = await this.prisma.block.findMany({
            where: {
                studioId: query.studioId,
                active: true,
                startAt: { lt: to },
                endAt: { gt: from },
            },
            select: { id: true, startAt: true, endAt: true, reason: true },
        });

        const isStaff = actor.role !== Role.USER;

        const items = [
            ...appointments.map((a) => {
                const mine = a.userId === actor.sub;
                const canSeeDetails = mine || isStaff
                return {
                    type: 'APPOINTMENT' as const,
                    startAt: a.startAt,
                    endAt: a.endAt,
                    mine,
                    ...(canSeeDetails
                        ? {
                            id: a.id,
                            userName: a.user.name,
                            durationName: a.duration.name,
                            createdAt: a.createdAt,
                        }
                    : {}),
                    ...(isStaff ? { userId : a.userId } : {})
                };
            }),
            ...blocks.map((b) => ({
                type: 'BLOCK' as const,
                startAt: b.startAt,
                endAt: b.endAt,
                ...(isStaff ? { id: b.id, reason: b.reason } : {}),
            })),
        ];

        return items.sort((x, y) => x.startAt.getTime() - y.startAt.getTime());
    }
}
