import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch('me')
    @Roles(Role.ADMIN, Role.OPERATOR, Role.USER)
    updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateMeDto) {
        return this.usersService.updateMe(req.user.sub, dto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}
