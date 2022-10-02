import * as BackendService from '../services/BackendService';
import * as ServerConfig from '../config/ServerConfig';
import User from '../classes/User';

const nock = require('nock');

// test putting notification key
describe(BackendService.sendNotifyTokenAPI, () => {
  it('should return code 200 for successful token sending', async () => {
    const newUser: User = new User('tucker', '987654', true);
    const scope = nock(ServerConfig.apiLink)
      .put(ServerConfig.getSendNotifKeyUrlExtension(newUser.userID))
      .reply(200);

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
      .reply(401);

    const result = await BackendService.sendNotifyTokenAPI(
      newUser.userID,
      'ExponentPushToken[0000000000]'
    );

    expect(result).toBe('401');
  });
});
