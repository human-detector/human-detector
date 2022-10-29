import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { CamerasService } from './cameras.service';
import { Notification } from './notification.entity';
import { NotFoundError } from '../errors.types';
import { Camera } from './camera.entity';

const notAUUID = 'junk';
const validCamID = '4fa660b3-bc2d-4d12-b427-32283ca04a07';
const invalidCamID = 'c5fde899-ac02-465a-ae8b-7e082f1789c8';

describe('CamerasService', () => {
  let camerasService: CamerasService;
  let mockedNotificationRepository;
  const mockedCameraRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    mockedNotificationRepository = {
      notifications: [Notification],
      persist: (notification: Notification) => {
        return;
      },
    };
    mockedCameraRepository.findOne.mockClear();

    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    camerasService = module.get<CamerasService>(CamerasService);
  });

  describe(`sendNotification('${notAUUID}')`, () => {
    it('should throw a TypeError', () => {
      expect(() => {
        camerasService.sendNotification(notAUUID);
      }).toThrow(TypeError);
    });
  });

  describe('sendNotification(invalidCamID)', () => {
    it('should not add a new notification to the list', () => {
      expect(() => {
        camerasService.sendNotification(invalidCamID);
      }).toThrow(NotFoundError);
    });
  });

  describe('sendNotification(validCamID)', () => {
    it('should add a new notification to the list', () => {
      const notifications = [...mockedNotificationRepository.notifications];
      camerasService.sendNotification(validCamID);
      expect(mockedNotificationRepository.notifications.length).toBe(
        notifications.length + 1,
      );
    });
  });

  describe(`getNotifications('${notAUUID}')`, () => {
    it('should throw a TypeError', () => {
      expect(() => {
        camerasService.getNotifications(notAUUID);
      }).toThrow(TypeError);
    });
  });

  describe('getNotifications(invalidCamID)', () => {
    it('should throw a NotFoundError', () => {
      expect(() => {
        camerasService.getNotifications(invalidCamID);
      }).toThrow(NotFoundError);
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
