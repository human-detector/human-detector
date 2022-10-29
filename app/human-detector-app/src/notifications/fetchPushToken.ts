import * as Notifications from 'expo-notifications';
import * as helpers from '../helpers';

/**
 * The isUserNotificationsOn method will check if a user has
 * notifications turned on.  If they do, then this will return true.
 *
 * @returns true if the user has notifications turned on.  Else, false.
 */
async function isUserNotificationsOn(): Promise<boolean> {
  // Check if the user allows notifications
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Fetch the push notification token for this device.
 */
export default async function fetchPushToken(): Promise<string> {
  // For notifications, the channel must be default for android
  if (helpers.getOS() === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (helpers.isDevice() && (await isUserNotificationsOn())) {
    const token: string = (await Notifications.getExpoPushTokenAsync()).data; // get token
    return token;
  }
  throw new Error('Failed to get push token for push notification!');
}
