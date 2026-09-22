import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso.');
    } catch (error) {
      this.logger.warn(
        `Não foi possível conectar ao banco de dados PostgreSQL: ${(error as Error).message}. O servidor continuará ativo para endpoints sem persistência direta.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
