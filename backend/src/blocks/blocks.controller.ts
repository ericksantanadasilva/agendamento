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
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OPERATOR)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateBlockDto) {
    return this.blocksService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Query('studioId') studioId?: string) {
    return this.blocksService.findAll(studioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blocksService.findOne(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.blocksService.deactivate(id);
  }
}
