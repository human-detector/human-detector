import { PermissionsAndroid, Platform } from 'react-native';

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