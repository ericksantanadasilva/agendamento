import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60_000;
const REUSE_GRACE_MS = 10_000;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);

    const passwordOk = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !user.active || !passwordOk) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.issueTokens(user.id, user.role, randomUUID());
  }

  async refresh(rawToken: string | undefined): Promise<AuthTokens> {
    if (!rawToken) {
      throw new UnauthorizedException('Sessão expirada');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { user: true },
    });
    if (!stored) {
      throw new UnauthorizedException('Sessão expirada');
    }

    if (stored.revokedAt) {
      const justRotated =
        Date.now() - stored.revokedAt.getTime() < REUSE_GRACE_MS;
      if (!justRotated) {
        await this.revokeFamily(stored.familyId);
      }
      throw new UnauthorizedException('Sessão expirada');
    }

    if (stored.expiresAt <= new Date() || !stored.user.active) {
      await this.revokeFamily(stored.familyId);
      throw new UnauthorizedException('Sessão expirada');
    }

    const rotated = await this.prisma.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (rotated.count === 0) {
      throw new UnauthorizedException('Sessão expirada');
    }

    return this.issueTokens(stored.user.id, stored.user.role, stored.familyId);
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });
    if (stored) {
      await this.revokeFamily(stored.familyId);
    }
  }

  private async issueTokens(
    userId: string,
    role: Role,
    familyId: string,
  ): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync({ sub: userId, role });

    const refreshToken = randomBytes(48).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  private revokeFamily(familyId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
