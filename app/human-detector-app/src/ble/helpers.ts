import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { Device, BleError } from 'react-native-ble-plx';
import { enc } from 'crypto-js';

/**
 * requestPermissions will ask the user to allow location permission
 * on their device
 * @param callback
 */
// eslint-disable-next-line import/prefer-default-export
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const grantedStatus = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy Needs Location Permission',
        buttonNegative: 'Cancel',
        buttonPositive: 'Ok',
        buttonNeutral: 'Maybe Later',
      }
    );
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);
    return grantedStatus === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

/**
 * Converts an Object into it's base64 representation
 *
 * @param obj JSON object to convert into base64
 * @returns Base64 encoded string
 */
export function jsonToBase64(obj: any): string {
  const jsonString = JSON.stringify(obj);
  const cryptoWord = enc.Utf8.parse(jsonString);
  return enc.Base64.stringify(cryptoWord);
}

/**
 * Converts a base64 string into an object
 *
 * @param val Base 64 string
 * @returns JSON object
 */
export function base64ToJson(val: string): any {
  const base64CryptoWord = enc.Base64.parse(val);
  const jsonStr = base64CryptoWord.toString(enc.Utf8);
  return JSON.parse(jsonStr);
}

/**
 * Checks for duplicate devices
 *
 * @param devices devices list
 * @param nextDevice device to check for duplicate
 * @returns true if duplicate, false otherwise
 */
export function isDuplicateDevice(devices: Device[], nextDevice: Device) {
  return devices.findIndex((device) => nextDevice.id === device.id) > -1;
}

/**
 * Checks a BleError and sends an alert to the user.
 *
 * @param err the error we are checking
 */

export function postBLEAlert(err: BleError) {
  switch (err.errorCode) {
    case 100:
      // 100: Bluetooth isn't supported on the device
      Alert.alert(
        'Bluetooth not supported!',
        "Connecting a camera isn't supported without bluetooth."
      );
      break;

    case 102:
      // 102: Bluetooth connection on the mobile device is turned off
      Alert.alert(
        'Bluetooth is off!',
        'Turn on bluetooth on your mobile device to connect a camera'
      );
      break;

    case 600:
      // 600: Scan start failed
      Alert.alert('Bluetooth scanning failed', 'Please try again.');
      break;

    case 601:
      // 602: If location services are turned off on the mobile device.
      Alert.alert(
        'Location services are off!',
        'Enabling location services for the EyeSpy app is required to connect a camera.'
      );
      break;

    default:
      Alert.alert('Bluetooth error', err.message);
  }
}
