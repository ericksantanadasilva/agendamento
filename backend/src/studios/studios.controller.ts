import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthenticatedRequest } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { StudiosService } from './studios.service';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('studios')
export class StudiosController {
    constructor(private readonly studiosService: StudiosService) { }

    @Post()
    create(@Body() dto: CreateStudioDto) {
        return this.studiosService.create(dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
    findAll(@Req() req: AuthenticatedRequest) {
        return this.studiosService.findAll(req.user.role !== Role.ADMIN);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
    findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.studiosService.findOne(id, req.user.role !== Role.ADMIN);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateStudioDto) {
        return this.studiosService.update(id, dto)
    }
}
