import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as helpers from '../helpers';
import { sendNotifyTokenAPI } from '../../services/backendService';

/**
 * This method will handle sending a users expo token
 * to the backend for push notifications.
 *
 * @returns a rejected Promise if something went wrong when retrieving or sending the expo token
 */
export default async function sendExpoNotifToken(): Promise<void> {}

/**
 * The getExponentPushToken is a helper for the sendExpoNotifToken function
 * and will get the Expo token from the users device to be used with push
 * notifications.
 *
 * @returns the current users expo token.
 */
async function getExponentPushToken(): Promise<string> {
  // Check if device is an emulator or not
  // Check for perms
}

/**
 * The checkUserNotificationPermissions method will check if a user has
 * notifications turned on.  If they do, then this will return true.
 *
 * @returns true if the user has notifications turned on.  Else, false.
 */
async function checkUserNotificationPermissions(): Promise<boolean> {
  // Check if the user allows notifications
}

const registerForPushNotificationsAsync = async () => {
  // Push notifications will only run on an actual device (no emulators)
  if (helpers.isDevice()) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    const token: string = (await Notifications.getExpoPushTokenAsync()).data; //get token
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  // Need to set notification channel to default for android devices
  if (helpers.getOS() === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
};
