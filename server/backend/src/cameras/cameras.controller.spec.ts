import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { CamerasController } from './cameras.controller';
import { Notification, CamerasService } from './cameras.service';

const validCamID = 'good-cam-id';
const invalidCamID = 'bad-cam-id';

const mockCamerasService = {
  sendNotification(id: string): boolean {
    return false;
  },
  getNotifications(id: string): Notification[] {
    return [];
  },
};

describe('CamerasController', () => {
  let camerasController: CamerasController;
  let camerasService: CamerasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CamerasService,
          useValue: mockCamerasService,
        },
      ],
      controllers: [CamerasController],
    }).compile();

    camerasController = module.get<CamerasController>(CamerasController);
    camerasService = module.get<CamerasService>(CamerasService);
  });

  describe('PUT /cameras/' + validCamID + '/notification', () => {
    it('should add a notification to the list', () => {
      /* TODO: see below */
      expect(camerasController.sendNotification(validCamID)).toBe(true);
    });
  });

  describe('PUT /cameras/' + invalidCamID + '/notification', () => {
    it('should fail to add a notification', () => {
      /* TODO: this should probably also check the value of getNotifications() before and after the call */
      expect(camerasController.sendNotification(validCamID)).toBe(
        new UnauthorizedException(),
      );
    });
  });
});
