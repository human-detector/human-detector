import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, MikroOrmModule } from '@mikro-orm/nestjs';
import { Collection } from '@mikro-orm/core';
import { CamerasService } from './cameras.service';
import { Camera } from './camera.entity';
import { NotFoundError } from '../errors.types';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';
import { Notification } from './notification.entity';
import dbConfig from '../../mikro-orm.config';
import { Module } from '@nestjs/common';
import { createCameraWithKeyPair } from '../../test/helpers/camera';
import { ConfigModule } from '@nestjs/config';
import { IPUSH_NOTIFICATIONS_SERVICE_TOKEN } from './push-notifications/push-notifications-service.interface';

const notAUUID = 'junk';
const validCamID = '4fa660b3-bc2d-4d12-b427-32283ca04a07';
const invalidCamID = 'c5fde899-ac02-465a-ae8b-7e082f1789c8';

describe('CamerasService', () => {
  let camerasService: CamerasService;
  let mockedNotificationRepository;
  let mockedCameraRepository;

  beforeEach(async () => {
    mockedNotificationRepository = {};
    mockedCameraRepository = {
      findOne: jest.fn(() => Promise.resolve(null)),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        CamerasService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockedNotificationRepository,
        },
        {
          provide: getRepositoryToken(Camera),
          useValue: mockedCameraRepository,
        },
        {
          provide: IPUSH_NOTIFICATIONS_SERVICE_TOKEN,
          useValue: 'bogus',
        },
      ],
    }).compile();

    camerasService = module.get<CamerasService>(CamerasService);
  });

  describe('sendNotification(invalidCamID)', () => {
    it('should not add a new notification to the list', () => {
      mockedCameraRepository.findOne.mockResolvedValueOnce(null);
      expect(camerasService.sendNotification(invalidCamID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  /*   On Unit Test strike with Mikro-ORM
  describe('sendNotification(validCamID)', () => {
    it('should add a new notification to the list', async () => {
      const camera = new Camera('suffering', 'pain');
      camera.group = new Group('Testing');
      camera.id = validCamID;
      camera.group.user = new User();
      camera.group.user.expoToken = 'ExponentPushToken[0000000000000000000000]';
      camera.notifications = new Collection<Notification, unknown>(camera);
      //camera.notifications.add(new Notification());
      const beforeNotificationLength = camera.notifications.length;
      mockedCameraRepository.findOne.mockResolvedValueOnce(camera);
      await camerasService.sendNotification(validCamID);
      expect(camera.notifications).toHaveLength(beforeNotificationLength + 1);
    });
  });
  */

  describe('getNotifications(invalidCamID)', () => {
    it('should throw a NotFoundError', () => {
      mockedCameraRepository.findOne.mockResolvedValueOnce(null);
      expect(camerasService.getNotifications(invalidCamID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('getPublicKey', () => {
    it("should return the camera's public key for valid cameras", () => {
      const camera = new Camera('bogus', 'my-public-key', 'bogus-serial');
      mockedCameraRepository.findOne.mockResolvedValueOnce(camera);
      expect(camerasService.getPublicKey('')).resolves.toBe(camera.publicKey);
    });

    it('should throw a NotFoundError for invalid camera IDs', () => {
      mockedCameraRepository.findOne.mockResolvedValueOnce(undefined);
      expect(camerasService.getPublicKey('')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
