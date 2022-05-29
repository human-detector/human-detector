import { Test, TestingModule } from '@nestjs/testing';
import { CamerasService } from './cameras.service';

describe('CamerasService', () => {
  let service: CamerasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CamerasService],
    }).compile();

    service = module.get<CamerasService>(CamerasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
