import {
  getPermissionsAsync,
  getExpoPushTokenAsync,
  requestPermissionsAsync,
} from 'expo-notifications';
import * as helpers from '../src/helpers';
import { sendNotifyTokenAPI } from '../services/backendService';
import { sendExpoNotifToken, getExponentPushToken } from '../src/notifications/notifTokenInit';

helpers.isDevice = jest.fn(() => true);

describe('sendExpoNotifToken() iOS', () => {
  helpers.getOS = jest.fn(() => 'iOS');

  it('will return void if the function is successful with getting the token ', async () => {
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
      getExpoPushTokenAsync: jest.fn(() => Promise.resolve()),
      requestPermissionsAsync: jest.fn(() => Promise.resolve()),
    }));

    await sendExpoNotifToken();
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(getPermissionsAsync).toHaveBeenCalled();
    expect(getExpoPushTokenAsync).toHaveBeenCalled();
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(0);
  });
  it('will return a reject if notifications are off', async () => {
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: jest.fn(() => ({ status: 'denied' })),
      getExpoPushTokenAsync: jest.fn(() => Promise.resolve()),
      requestPermissionsAsync: jest.fn(() => Promise.resolve()),
    }));

    const errorMsg = '';
    await expect(sendExpoNotifToken()).rejects.toBe(errorMsg);
  });
  it('will return a reject with error message error in sending to server', async () => {
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
      getExpoPushTokenAsync: jest.fn(() => Promise.resolve()),
      requestPermissionsAsync: jest.fn(() => Promise.resolve()),
    }));

    sendNotifyTokenAPI = jest.fn(() => Promise.reject());

    const errorMsg = '';
    await expect(sendExpoNotifToken()).rejects.toBe(errorMsg);
  });
  it('will return a reject if there is an error with getting the ExpoPushToken from the user', async () => {
    jest.mock('expo-notifications', async () => ({
      getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
      getExpoPushTokenAsync: jest.fn(() => Promise.resolve()),
      requestPermissionsAsync: jest.fn(() => Promise.resolve()),
    }));

    const errorMsg = '';
    await expect(sendExpoNotifToken()).rejects.toBe(errorMsg);
  });
});
