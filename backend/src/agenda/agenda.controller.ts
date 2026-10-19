import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthenticatedRequest } from 'src/auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AgendaService } from './agenda.service';
import { AgendaQueryDto } from './dto/agenda-query.dto';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
@Controller('agenda')
export class AgendaController {
    constructor(private readonly agendaService: AgendaService) {}

    @Get()
    find(@Req() req: AuthenticatedRequest, @Query() query: AgendaQueryDto) {
        return this.agendaService.find(req.user, query);
    }
}
