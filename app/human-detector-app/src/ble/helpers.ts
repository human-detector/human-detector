import { PermissionsAndroid, Platform } from 'react-native';
import { Device } from 'react-native-ble-plx';
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
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        ]);
        return grantedStatus === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
};

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
    JSON.parse(jsonStr);
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