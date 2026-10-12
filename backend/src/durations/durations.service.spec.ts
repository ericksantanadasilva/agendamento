import { Test, TestingModule } from '@nestjs/testing';
import { DurationsService } from './durations.service';

describe('DurationsService', () => {
  let service: DurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DurationsService],
    }).compile();

    service = module.get<DurationsService>(DurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
