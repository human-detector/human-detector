import * as BackendService from '../services/BackendService';
import * as ServerConfig from '../config/ServerConfig';
import User from '../classes/User';
import Group from '../classes/Group';
import Camera from '../classes/Camera';

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
  const newUser: User = new User('bigheadgeorge', '1234565', true);

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
    groupObj.cameras[0] = new Camera('789', 'Camesfsefera 1', 'ID444');
    groupObj.cameras[1] = new Camera('456', 'Camefesfra 2', 'ID2555');

    const groups: Array<Group> = [];
    groups.push(groupObj);
    groups.push(groupObj2);

    const scope = nock(ServerConfig.apiLink)
      .get(ServerConfig.getGroupsListUrlExtension(newUser.userID))
      .reply(200, JSON.stringify(groups));

    const result = await BackendService.getGroupListAPI(newUser.userID);
    console.log(JSON.stringify(groups));
    expect(result).toBe(groups);
  });
});
