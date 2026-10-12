import { Module } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { StudiosController } from './studios.controller';

@Module({
  providers: [StudiosService],
  controllers: [StudiosController]
})
export class StudiosModule {}
