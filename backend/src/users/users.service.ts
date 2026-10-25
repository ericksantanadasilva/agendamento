import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
      },
      omit: { passwordHash: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      omit: { passwordHash: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      const currentOk = await bcrypt.compare(
        dto.currentPassword ?? '',
        user.passwordHash,
      );
      if (!currentOk) {
        throw new BadRequestException('Senha atual incorreta');
      }
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, passwordHash },
      omit: { passwordHash: true },
    });
  }

  async update(adminId: string, id: string, dto: UpdateUserDto) {
    if (id === adminId) {
      const demoting = dto.role !== undefined && dto.role !== Role.ADMIN;
      const deactivating = dto.active === false;
      if (demoting || deactivating) {
        throw new ForbiddenException(
          'Você não pode rebaixar nem desativar a si mesmo',
        );
      }
    }

    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { name: dto.name, role: dto.role, active: dto.active },
      omit: { passwordHash: true },
    });
  }

  async resetPassword(adminId: string, id: string, dto: ResetPasswordDto) {
    if (id === adminId) {
      throw new ForbiddenException(
        'Para trocar a sua própria senha, use a troca de senha do seu perfil',
      );
    }

    await this.findOne(id);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { success: true };
  }

  findOptions() {
    return this.prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  }
}
