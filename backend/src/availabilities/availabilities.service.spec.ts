import { Test, TestingModule } from '@nestjs/testing';
import { AvaiabilitiesService } from './availabilities.service';

describe('AvaiabilitiesService', () => {
  let service: AvaiabilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvaiabilitiesService],
    }).compile();

    service = module.get<AvaiabilitiesService>(AvaiabilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
