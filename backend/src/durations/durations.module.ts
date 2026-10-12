import { Module } from '@nestjs/common';
import { DurationsService } from './durations.service';
import { DurationsController } from './durations.controller';

@Module({
  providers: [DurationsService],
  controllers: [DurationsController]
})
export class DurationsModule {}
