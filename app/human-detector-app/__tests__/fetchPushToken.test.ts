import * as Notifications from 'expo-notifications';
import { PermissionResponse, PermissionStatus } from 'expo-modules-core';
import { NotificationPermissionsStatus } from 'expo-notifications';
import * as helpers from '../src/helpers';
import fetchPushToken from '../src/notifications/fetchPushToken';

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

// Permanent mocks
beforeEach(() => {
  mockIsDevice.mockReturnValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchPushToken() iOS', () => {
  mockGetOS.mockReturnValue('ios');

  it('will return void if the function is successful with getting the token ', async () => {
    const pushToken = 'ExponentPushToken[000000000000]';
    // Success mocks
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: pushToken,
    });

    expect(await fetchPushToken()).toBe(pushToken);
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(0);
  });

  it('will return void if successful and user just turns on notifications', async () => {
    // Success mocks
    const pushToken = 'ExponentPushToken[000000000000]';
    mockGetPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.UNDETERMINED)
    );
    mockRequestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.GRANTED)
    );
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: pushToken,
    });

    expect(await fetchPushToken()).toBe(pushToken);
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
    await expect(fetchPushToken()).rejects.toStrictEqual(new Error(errorMsg));
  });

  it('will return a reject if notifications are off', async () => {
    const pushToken = 'ExponentPushToken[000000000000]';
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.DENIED)); // User turned off notifications
    mockRequestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(PermissionStatus.DENIED)
    ); // User presses no to notifiations
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: pushToken,
    });

    const errorMsg = 'Failed to get push token for push notification!';
    await expect(fetchPushToken()).rejects.toStrictEqual(new Error(errorMsg));
  });

  it('will return a reject if there is an error with getting the ExpoPushToken from the user', async () => {
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockGetExpoPushTokenAsync.mockRejectedValueOnce(new Error('Placeholder Error for Test 4')); // Getting from the user error

    const errorMsg = 'Placeholder Error for Test 4';
    await expect(fetchPushToken()).rejects.toStrictEqual(new Error(errorMsg));
  });
});

describe('fetchPushToken() android', () => {
  mockGetOS.mockReturnValue('android');
  it('will return void if the function is successful with getting the token ', async () => {
    // Success mocks
    const pushToken = 'ExponentPushToken[000000000000]';
    mockGetPermissionsAsync.mockResolvedValue(createPermissionResponse(PermissionStatus.GRANTED));
    mockSetNotificationChannelAsync.mockResolvedValueOnce(null);
    mockGetExpoPushTokenAsync.mockResolvedValue({
      type: 'expo',
      data: pushToken,
    });

    await fetchPushToken();
    expect(helpers.isDevice).toHaveBeenCalledTimes(1);
    expect(helpers.getOS).toHaveBeenCalledTimes(1);
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(0);
  });
});
