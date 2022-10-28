import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, UnauthorizedException } from '@nestjs/common';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { Notification } from './notification.entity';
import { CameraAuthGuard } from './camera-auth.guard';

const validCamID = '4df87db2-d185-4126-8570-28bec04c1b16';
const invalidCamID = '9a988948-450d-4627-bf51-ee4a94f4d5bf';

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

  beforeEach(async () => {
    const mockCameraAuthGuard: CanActivate = {
      canActivate: () => Promise.resolve(true),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CamerasService,
          useValue: mockCamerasService,
        },
        {
          provide: CameraAuthGuard,
          useValue: mockCameraAuthGuard,
        },
      ],
      controllers: [CamerasController],
    }).compile();

    camerasController = module.get<CamerasController>(CamerasController);
  });

  /*  On Unit Test strike with Mikro-ORM
  describe('PUT /cameras/' + validCamID + '/notification', () => {
    it('should add a notification to the list', () => {
      // TODO: see below
      expect(camerasController.sendNotification(validCamID)).toBe(true);
    });
  });
  

  describe('PUT /cameras/' + invalidCamID + '/notification', () => {
    it('should fail to add a notification', () => {
      expect(() => {
        camerasController.sendNotification(invalidCamID);
      }).toThrow(UnauthorizedException);
    });
  });
  */

  describe('PUT /cameras/' + validCamID + '/heartbeat', () => {
    it('should return 200 OK', () => {
      expect(camerasController.heartbeat(validCamID)).toBe('');
    });
  });
});
