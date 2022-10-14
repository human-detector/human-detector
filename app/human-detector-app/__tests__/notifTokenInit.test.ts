import * as Notifications from 'expo-notifications';
import * as helpers from '../src/helpers';
import * as BackendService from '../services/backendService';
import * as ServerConfig from '../config/ServerConfig';
import { sendExpoNotifToken, getExponentPushToken } from '../src/notifications/notifTokenInit';
import User from '../classes/User';

// Allows mocking of expo-notifications
jest.mock('expo-notifications');

// Example user
const user: User = new User('fjosejfoesf', '3232323', true);

// Permanent mocks
beforeEach(() => {
  helpers.isDevice = jest.fn(() => true);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('sendExpoNotifToken() iOS', () => {
  helpers.getOS = jest.fn(() => 'iOS');

  it('will return void if the function is successful with getting the token ', async () => {
    // Success mocks
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[000000000000]',
    });
    BackendService.sendNotifyTokenAPI = jest.fn(() => Promise.resolve());

    await sendExpoNotifToken(user.userID);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(0);
    expect(BackendService.sendNotifyTokenAPI).toBeCalledWith(
      user.userID,
      'ExponentPushToken[000000000000]'
    );
  });

  it('will return void if successful and user just turns on notifications', async () => {
    // Success mocks
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[000000000000]',
    });
    BackendService.sendNotifyTokenAPI = jest.fn(() => Promise.resolve());

    await sendExpoNotifToken(user.userID);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1); // This should now be called to ask the user
  });

  it('will return a reject if user just turns off notifications', async () => {
    // Success mocks
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const errorMsg = 'Failed to get push token for push notification!';
    await expect(sendExpoNotifToken(user.userID)).rejects.toStrictEqual(new Error(errorMsg));
  });

  it('will return a reject if notifications are off', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' }); // User turned off notifications
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' }); // User presses no to notifiations
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[000000000000]',
    });

    const errorMsg = 'Failed to get push token for push notification!';
    await expect(sendExpoNotifToken(user.userID)).rejects.toStrictEqual(new Error(errorMsg));
  });

  it('will return a reject with error message error in sending to server', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    BackendService.sendNotifyTokenAPI = jest.fn(() =>
      Promise.reject(new Error('Placeholder Error'))
    ); // Sending to server error

    const errorMsg = 'Placeholder Error';
    await expect(sendExpoNotifToken(user.userID)).rejects.toStrictEqual(new Error(errorMsg));
  });

  it('will return a reject if there is an error with getting the ExpoPushToken from the user', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync = jest.fn(() =>
      Promise.reject(new Error('Placeholder Error for Test 4'))
    ); // Getting from the user error

    const errorMsg = 'Placeholder Error for Test 4';
    await expect(sendExpoNotifToken(user.userID)).rejects.toStrictEqual(new Error(errorMsg));
  });
});

describe('sendExpoNotifToken() android', () => {
  helpers.getOS = jest.fn(() => 'android');
  it('will return void if the function is successful with getting the token ', async () => {
    // Success mocks
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.setNotificationChannelAsync = jest.fn(() => Promise.resolve());
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[000000000000]',
    });
    BackendService.sendNotifyTokenAPI = jest.fn(() => Promise.resolve());

    await sendExpoNotifToken(user.userID);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(0);
  });
});
