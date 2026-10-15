import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Post()
    create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAppointmentDto) {
        return this.appointmentsService.create(req.user, dto);
    }
}
