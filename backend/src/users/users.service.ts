import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

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
}
