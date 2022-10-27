import * as Notifications from 'expo-notifications';
import { PermissionResponse, PermissionStatus } from 'expo-modules-core';
import { NotificationPermissionsStatus } from 'expo-notifications';
import * as helpers from '../src/helpers';
import * as BackendService from '../services/backendService';
import { sendExpoNotifToken } from '../src/notifications/notifTokenInit';
import User from '../classes/User';

// Allows mocking of expo-notifications
jest.mock('expo-notifications');
const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.MockedFunction<
  typeof Notifications.getPermissionsAsync
>;
const mockRequestPermissionsAsync = Notifications.requestPermissionsAsync as jest.MockedFunction<
  typeof Notifications.getPermissionsAsync
>;
const mockGetExpoPushTokenAsync = Notifications.getExpoPushTokenAsync as jest.MockedFunction<
  typeof Notifications.getExpoPushTokenAsync
>;
const mockSetNotificationChannelAsync =
  Notifications.setNotificationChannelAsync as jest.MockedFunction<
    typeof Notifications.setNotificationChannelAsync
  >;

jest.mock('../services/backendService');
const mockSendNotifyToken = BackendService.sendNotifyTokenAPI as jest.MockedFunction<
  typeof BackendService.sendNotifyTokenAPI
>;

jest.mock('../src/helpers');
const mockGetOS = helpers.getOS as jest.MockedFunction<typeof helpers.getOS>;
const mockIsDevice = helpers.isDevice as jest.MockedFunction<typeof helpers.isDevice>;

// Generate a dummy permission response for testing
function createPermissionResponse(status: PermissionStatus): PermissionResponse {
  return {
    status,
    expires: 'never',
    granted: status === PermissionStatus.GRANTED,
    canAskAgain: true,
  };
}

// Example user
const user: User = new User('fjosejfoesf', '3232323', true);
// Example access token
const exampleAccessToken = 'ExampleAccessToken';

// Permanent mocks
beforeEach(() => {
  mockIsDevice.mockReturnValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('sendExpoNotifToken() iOS', () => {
  mockGetOS.mockReturnValue('ios');

  it('will return void if the function is successful with getting the token ', async () => {
    // Success mocks
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[000000000000]',
    });
    mockSendNotifyToken.mockResolvedValueOnce();

    await sendExpoNotifToken(user.userID, exampleAccessToken);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(0);
    expect(BackendService.sendNotifyTokenAPI).toBeCalledWith(
      user.userID,
      'ExponentPushToken[000000000000]',
      exampleAccessToken
    );
  });

  it('will return void if successful and user just turns on notifications', async () => {
    // Success mocks
    mockGetPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.UNDETERMINED)
    );
    mockRequestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.GRANTED)
    );
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[000000000000]',
    });
    mockSendNotifyToken.mockResolvedValueOnce();

    await sendExpoNotifToken(user.userID, exampleAccessToken);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1); // This should now be called to ask the user
  });

  it('will return a reject if user just turns off notifications', async () => {
    // Success mocks
    mockGetPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.UNDETERMINED)
    );
    mockRequestPermissionsAsync.mockResolvedValue({
      status: PermissionStatus.DENIED,
    } as NotificationPermissionsStatus);

    const errorMsg = 'Failed to get push token for push notification!';
    await expect(sendExpoNotifToken(user.userID, exampleAccessToken)).rejects.toStrictEqual(
      new Error(errorMsg)
    );
  });

  it('will return a reject if notifications are off', async () => {
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.DENIED)); // User turned off notifications
    mockRequestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.DENIED)
    ); // User presses no to notifiations
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[000000000000]',
    });

    const errorMsg = 'Failed to get push token for push notification!';
    await expect(sendExpoNotifToken(user.userID, exampleAccessToken)).rejects.toStrictEqual(
      new Error(errorMsg)
    );
  });

  it('will return a reject with error message error in sending to server', async () => {
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockSendNotifyToken.mockRejectedValueOnce(new Error('Placeholder Error')); // Sending to server error

    const errorMsg = 'Placeholder Error';
    await expect(sendExpoNotifToken(user.userID, exampleAccessToken)).rejects.toStrictEqual(
      new Error(errorMsg)
    );
  });

  it('will return a reject if there is an error with getting the ExpoPushToken from the user', async () => {
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockGetExpoPushTokenAsync.mockRejectedValueOnce(new Error('Placeholder Error for Test 4')); // Getting from the user error

    const errorMsg = 'Placeholder Error for Test 4';
    await expect(sendExpoNotifToken(user.userID, exampleAccessToken)).rejects.toStrictEqual(
      new Error(errorMsg)
    );
  });
});

describe('sendExpoNotifToken() android', () => {
  mockGetOS.mockReturnValue('android');
  it('will return void if the function is successful with getting the token ', async () => {
    // Success mocks
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockSetNotificationChannelAsync.mockResolvedValueOnce(null);
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[000000000000]',
    });
    mockSendNotifyToken.mockResolvedValueOnce();

    await sendExpoNotifToken(user.userID, exampleAccessToken);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(0);
  });
});
