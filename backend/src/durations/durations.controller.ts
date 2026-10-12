import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthenticatedRequest } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateDurationDto } from './dto/create-duration.dto';
import { UpdateDurationDto } from './dto/update-duration.dto';
import { DurationsService } from './durations.service';
import { create } from 'domain';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('durations')
export class DurationsController {
  constructor(private readonly durationsService: DurationsService) {}

  @Post()
  create(@Body() dto: CreateDurationDto) {
    return this.durationsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
  findAll(@Req() req: AuthenticatedRequest) {
    return this.durationsService.findAll(req.user.role !== Role.ADMIN);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.durationsService.findOne(id, req.user.role !== Role.ADMIN);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDurationDto) {
    return this.durationsService.update(id, dto);
  }
}
