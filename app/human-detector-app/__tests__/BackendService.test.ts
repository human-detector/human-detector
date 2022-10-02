import * as BackendService from '../services/BackendService';
import * as ServerConfig from '../config/ServerConfig';
import User from '../classes/User';
import Group from '../classes/Group';
import Camera from '../classes/Camera';
import Notification from '../classes/Notification';

const nock = require('nock');

// test putting notification key
describe(BackendService.sendNotifyTokenAPI, () => {
  it('should return code 200 for successful token sending', async () => {
    const newUser: User = new User('tucker', '987654', true);
    const scope = nock(ServerConfig.apiLink)
      .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userID))
      .reply(200, 'success');

    const result: Promise<string> = await BackendService.sendNotifyTokenAPI(
      newUser.userID,
      'ExponentPushToken[0000000000]'
    );

    expect(result).toBe('200');
  });

  it("should return code 401 if user id doesn't exist", async () => {
    const newUser: User = new User('tucker', '987654', true);
    const scope = nock(ServerConfig.apiLink)
      .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userID))
      .reply(401, 'fail');

    const result = await BackendService.sendNotifyTokenAPI(
      newUser.userID,
      'ExponentPushToken[0000000000]'
    );

    expect(result).toBe('401');
  });
});

describe(BackendService.getGroupListAPI, () => {
  const newUser: User = new User('bigheadgeorge', '0', true);

  it('should return null if there is an error', async () => {
    const scope = nock(ServerConfig.apiLink)
      .get(ServerConfig.getGroupsListUrlExtension(newUser.userID))
      .reply(401, 'error');

    const result = await BackendService.getGroupListAPI(newUser.userID);

    expect(result).toBe(null);
  });

  it('should return list of groups when successful', async () => {
    const groupObj: Group = new Group('Group 1', 'ID');
    groupObj.cameras[0] = new Camera('0', 'Camera 1', 'ID');
    groupObj.cameras[1] = new Camera('0', 'Camera 2', 'ID2');

    const groupObj2: Group = new Group('Grosefsefup 1', 'ID333');
    groupObj2.cameras[0] = new Camera('0', 'Camesfsefera 1', 'ID444');
    groupObj2.cameras[1] = new Camera('0', 'Camefesfra 2', 'ID2555');

    const groups: Array<Group> = [];
    groups.push(groupObj);
    groups.push(groupObj2);

    const scope = nock(ServerConfig.apiLink)
      .get(ServerConfig.getGroupsListUrlExtension(newUser.userID))
      .reply(200, JSON.stringify(groups));

    const result = await BackendService.getGroupListAPI(newUser.userID);

    expect(result[0]).toEqual(groups[0]);
    expect(result[1]).toEqual(groups[1]);
    expect(result).toEqual(groups);
  });
});

describe(BackendService.getNotificationHistoryAPI, () => {
  const newUser: User = new User('bigheadgeorge', '1234565', true);

  it('should return null if there is an error', async () => {
    const scope = nock(ServerConfig.apiLink)
      .get(ServerConfig.getNotificationHistoryUrlExtension(newUser.userID))
      .reply(401, 'error');

    const result = await BackendService.getNotificationHistoryAPI(newUser.userID);

    expect(result).toBe(null);
  });

  it('should return notification history of the current user when theres a valid notification history', async () => {
    // make notification array
    const cam: Camera = new Camera('9999', 'testCamera', '29292');
    const notif1: Notification = new Notification('2022-06-14T03:24:00', cam);
    const notif2: Notification = new Notification('2007-12-27T00:00:00', cam);

    const notifHistory: Notification[] = [notif1, notif2];

    const scope = nock(ServerConfig.apiLink)
      .get(ServerConfig.getNotificationHistoryUrlExtension(newUser.userID))
      .reply(200, JSON.stringify(notifHistory));

    const result = await BackendService.getNotificationHistoryAPI(newUser.userID);

    expect(result).toEqual(notifHistory);
  });
});
