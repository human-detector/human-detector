import * as Notifications from 'expo-notifications';
import * as helpers from '../helpers';
import { sendNotifyTokenAPI } from '../../services/backendService';

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
  if (finalStatus !== 'granted') {
    return false;
  }
  return true;
}

/**
 * The getExponentPushToken is a helper for the sendExpoNotifToken function
 * and will get the Expo token from the users device to be used with push
 * notifications.
 *
 * @returns the current users expo token.
 */
export async function getExponentPushToken(): Promise<string> {
  // For notifications, the channel must be default for android
  try {
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
    console.error('Failed to get push token for push notification!');
    return await Promise.reject(new Error('Failed to get push token for push notification!'));
  } catch (error) {
    // Takes care of other errors
    return Promise.reject(error);
  }
}

/**
 * This method will handle sending a users expo token
 * to the backend for push notifications.
 *
 * @returns a rejected Promise if something went wrong when retrieving or sending the expo token
 */
// eslint-disable-next-line import/prefer-default-export
export async function sendExpoNotifToken(userId: string): Promise<void> {
  try {
    // Get the token from the user device
    const token = await getExponentPushToken();
    // Send the token if success
    await sendNotifyTokenAPI(userId, token);
    return await Promise.resolve();
  } catch (error) {
    // If any error occurs, reject out
    return Promise.reject(error.message);
  }
}
