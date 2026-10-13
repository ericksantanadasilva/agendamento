import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('availabilities')
export class AvailabilitiesController {
    constructor(
        private readonly availabilitiesService: AvailabilitiesService,
    ) { }

    @Post()
    create(@Body() dto: CreateAvailabilityDto) {
        return this.availabilitiesService.create(dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
    findAll(
        @Req() req: AuthenticatedRequest,
        @Query('studioId') studioId?: string,
    ) {
        return this.availabilitiesService.findAll(
            req.user.role !== Role.ADMIN,
            studioId,
        );
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
    findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.availabilitiesService.findOne(id, req.user.role !== Role.ADMIN);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
        return this.availabilitiesService.update(id, dto);
    }
}   
