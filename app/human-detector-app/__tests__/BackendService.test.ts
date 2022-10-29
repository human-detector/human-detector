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
    const newUser: User = new User('tucker', '987654', true);

    it('should return code 200 for successful token sending', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userID))
        .reply(200, 'success');

      await backendService.sendNotifyTokenAPI('ExponentPushToken[0000000000]');
    });

    it("should return code 401 if user id doesn't exist", async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userID))
        .reply(401, 'fail');

      await expect(
        backendService.sendNotifyTokenAPI('ExponentPushToken[0000000000]')
      ).rejects.toThrow(AxiosError);
    });
  });

  describe('getGroupListAPI', () => {
    const backendService = new BackendService(mockTokenManager);
    const newUser: User = new User('bigheadgeorge', '0', true);

    it('should return null if there is an error', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .get(ServerConfig.getGroupsListUrlExtension(newUser.userID))
        .reply(401, 'error');

      const result = await backendService.getGroupListAPI();

      expect(result).toBe(null);
    });

    it('should return list of groups when successful', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);

      const groupObj: Group = new Group('Group 1', 'ID');
      groupObj.cameras[0] = new Camera('0', 'Camera 1', 'ID');
      groupObj.cameras[1] = new Camera('0', 'Camera 2', 'ID2');

      const groupObj2: Group = new Group('Grosefsefup 1', 'ID333');
      groupObj2.cameras[0] = new Camera('0', 'Camesfsefera 1', 'ID444');
      groupObj2.cameras[1] = new Camera('0', 'Camefesfra 2', 'ID2555');

      const groups: Array<Group> = [];
      groups.push(groupObj);
      groups.push(groupObj2);

      nock(ServerConfig.apiLink)
        .get(ServerConfig.getGroupsListUrlExtension(newUser.userID))
        .reply(200, JSON.stringify(groups));

      const result = await backendService.getGroupListAPI();

      expect(result).toEqual(groups);
    });
  });

  describe('getNotificationHistoryAPI', () => {
    const backendService = new BackendService(mockTokenManager);
    const newUser: User = new User('bigheadgeorge', '1234565', true);

    it('should return null if there is an error', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);
      nock(ServerConfig.apiLink)
        .get(ServerConfig.getNotificationHistoryUrlExtension(newUser.userID))
        .reply(401, 'error');

      const result = await backendService.getNotificationHistoryAPI();

      expect(result).toBe(null);
    });

    it('should return notification history of the current user when theres a valid notification history', async () => {
      mockTokenManager.getUser.mockReturnValue(newUser);

      // make notification array
      const cam: Camera = new Camera('9999', 'testCamera', '29292');
      const notif1: Notification = new Notification('2022-06-14T03:24:00', cam);
      const notif2: Notification = new Notification('2007-12-27T00:00:00', cam);

      const notifHistory: Notification[] = [notif1, notif2];

      nock(ServerConfig.apiLink)
        .get(ServerConfig.getNotificationHistoryUrlExtension(newUser.userID))
        .reply(200, JSON.stringify(notifHistory));

      const result = await backendService.getNotificationHistoryAPI();

      expect(result).toEqual(notifHistory);
    });
  });
});
