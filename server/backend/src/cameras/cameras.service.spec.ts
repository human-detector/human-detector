import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, MikroOrmModule } from '@mikro-orm/nestjs';
import { CamerasService } from './cameras.service';
import { Camera } from './camera.entity';
import { NotFoundError } from '../errors.types';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';
import { Notification } from './notification.entity';
import dbConfig from '../../mikro-orm.config';
import { Module } from '@nestjs/common';

const notAUUID = 'junk';
const validCamID = '4fa660b3-bc2d-4d12-b427-32283ca04a07';
const invalidCamID = 'c5fde899-ac02-465a-ae8b-7e082f1789c8';
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('CamerasService', () => {
  let camerasService: CamerasService;
  let mockedNotificationRepository;
  let mockedCamera: Camera;
  let mockedCameraRepository;

  beforeEach(async () => {
    mockedCamera = new Camera('Suffering', 'not-a-token');
    mockedCamera;
    mockedCamera.group = new Group('Not-a-threads-group');
    mockedCamera.group.user = new User();
    mockedCamera.group.user.expoToken = 'aaa';
    mockedCameraRepository = {
      cameras: [mockedCamera],
      findOne: async (where, populate): Promise<Camera> => {
        if (!uuidRegex.test(where.id)) {
          throw new TypeError('Invalid UUID');
        }
        if (where.id === validCamID) {
          return mockedCameraRepository.cameras[0];
        }
        return null;
      },
    };
    mockedCameraRepository.findOne.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CamerasService,
        {
          provide: getRepositoryToken(Camera),
          useValue: mockedCameraRepository,
        },
        {
          provide: getRepositoryToken(Camera),
          useValue: mockedCameraRepository,
        },
      ],
    }).compile();

    camerasService = module.get<CamerasService>(CamerasService);
  });

  describe(`sendNotification('${notAUUID}')`, () => {
    it('should throw a TypeError', () => {
      expect(camerasService.sendNotification(notAUUID)).rejects.toThrow(
        TypeError,
      );
    });
  });

  describe('sendNotification(invalidCamID)', () => {
    it('should not add a new notification to the list', () => {
      expect(camerasService.sendNotification(invalidCamID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('sendNotification(validCamID)', () => {
    it('should add a new notification to the list', async () => {
      const notificationLength = mockedCamera.notifications.length;
      await camerasService.sendNotification(validCamID);
      expect(mockedCamera.notifications.length).toBe(notificationLength + 1);
    });
  });

  describe(`getNotifications('${notAUUID}')`, () => {
    it('should throw a TypeError', () => {
      expect(camerasService.getNotifications(notAUUID)).rejects.toThrow(
        TypeError,
      );
    });
  });

  describe('getNotifications(invalidCamID)', () => {
    it('should throw a NotFoundError', () => {
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
