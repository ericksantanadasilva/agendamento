import { Test, TestingModule } from '@nestjs/testing';
import { AvaiabilitiesController } from './availabilities.controller';

describe('AvaiabilitiesController', () => {
  let controller: AvaiabilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvaiabilitiesController],
    }).compile();

    controller = module.get<AvaiabilitiesController>(AvaiabilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
