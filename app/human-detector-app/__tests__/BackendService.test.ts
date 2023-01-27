import nock from 'nock';
import { AxiosError } from 'axios';
import BackendService from '../services/backendService';
import TokenManager from '../src/auth/tokenManager';
import * as ServerConfig from '../config/ServerConfig';
import User from '../classes/User';
import Group from '../classes/Group';
import Camera from '../classes/Camera';
import Notification from '../classes/Notification';

const exampleAccessToken = 'ExampleAccessToken';

describe(BackendService, () => {
  // I want to use 'jest-ts-auto-mock', but Expo won't let me! :)))
  const mockTokenManager: jest.Mocked<TokenManager> = {
    getAccessToken: jest.fn(),
    getUser: jest.fn(),
  } as unknown as jest.Mocked<TokenManager>;

  beforeEach(() => {
    mockTokenManager.getAccessToken.mockResolvedValue(exampleAccessToken);
    mockTokenManager.getUser.mockClear();
  });

  // test putting notification key
  describe('sendNotifyTokenAPI', () => {
    const backendService = new BackendService(mockTokenManager);
    const newUser: User = new User('tucker', '987654', []);

    it('should return code 200 for successful token sending', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userId))
        .reply(200, 'success');

      await backendService.sendNotifyTokenAPI('ExponentPushToken[0000000000]');
    });

    it("should return code 401 if user id doesn't exist", async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userId))
        .reply(401, 'fail');

      await expect(
        backendService.sendNotifyTokenAPI('ExponentPushToken[0000000000]')
      ).rejects.toThrow(AxiosError);
    });
  });

  describe('getGroupListAPI', () => {
    const backendService = new BackendService(mockTokenManager);
    const newUser: User = new User('bigheadgeorge', '0', []);

    it('should return null if there is an error', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .get(ServerConfig.getGroupsListUrlExtension(newUser.userId))
        .reply(401, 'error');

      const result = await backendService.getGroupListAPI();

      expect(result).toBe(null);
    });

    it('should return list of groups when successful', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);

      const groupMock = {
        id: 'id',
        name: 'group1',
        cameras: [
          { id: '4324324', name: 'cameraname', notifications: [] },
          {
            id: '473843',
            name: 'cameraname2',
            notifications: [
              {
                id: '48374834',
                timestamp: '2022-06-14T03:24:00',
                snapshotId: 'test',
                groupId: 'id',
                cameraId: '473843',
              },
            ],
          },
        ],
      };

      const groups = [groupMock];
      const groupResult: Group[] = [
        new Group('group1', 'id', [
          new Camera('cameraname', '4324324', []),
          new Camera('cameraname2', '473843', [
            new Notification('48374834', new Date('2022-06-14T03:24:00'), 'test', '473843'),
          ]),
        ]),
      ];

      nock(ServerConfig.apiLink)
        .get(ServerConfig.getGroupsListUrlExtension(newUser.userId))
        .reply(200, JSON.stringify(groups));

      const result = await backendService.getGroupListAPI();

      expect(groupResult).toEqual(result);
    });
  });

  describe('getNotificationHistoryAPI', () => {
    const backendService = new BackendService(mockTokenManager);
    const newUser: User = new User('bigheadgeorge', '1234565', []);

    it('should return null if there is an error', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .get(ServerConfig.getNotificationHistoryUrlExtension(newUser.userId))
        .reply(401, 'error');

      const result = await backendService.getNotificationHistoryAPI();

      expect(result).toBe(null);
    });

    it('should return notification history of the current user when theres a valid notification history', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);

      // make notification array
      const notif1: Notification = new Notification('e', '2022-06-14T03:24:00', 'bee', 'cameraId');
      const notif2: Notification = new Notification('a', '2007-12-27T00:00:00', 'wawa', 'cameraId');

      const notifHistory: Notification[] = [notif1, notif2];

      nock(ServerConfig.apiLink)
        .get(ServerConfig.getNotificationHistoryUrlExtension(newUser.userId))
        .reply(200, JSON.stringify(notifHistory));

      const result = await backendService.getNotificationHistoryAPI();

      expect(result).toEqual(notifHistory);
    });
  });
});
