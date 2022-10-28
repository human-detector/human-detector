
import { BleError, Characteristic, Device } from 'react-native-ble-plx';
import NetInfo from '@react-native-community/netinfo';
import * as EyeSpyUUID from '../../config/BLEConfig';

interface CameraSerial {
    serial: string;
    pubKey: string; 
}


/**
 * getCameraSerialFromBLE will read the Eyespy Serial
 * @param device 
 * @returns Returns camera serial and BLE
 */
export async function getCameraSerialFromBLE (device: Device): CameraSerial {
// Get EyeSpy serial characteristic
    try {
        const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
        const characteristic: Characteristic = (await deviceDiscovered.readCharacteristicForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.SERIAL_UUID));

        if(characteristic.value) {
            const serialValues = JSON.parse(window.atob(characteristic.value));
            console.log(serialValues);
        }
        else {
            throw new Error("ERROR: No value in characteristic!");
        }

        return {
            "pubKey": "Test",
            "serial": "Test"
        }
    }
    catch (error) {
        console.log('NO DEVICE CONNECTED', error);
    }
}

/**
 * This method will write to the write to EyeSpy Wifi to write
 * @param device 
 */
export async function writeCameraWifi (device: Device, password: string, cameraUUID: string): Promise<void> {
    try {
        const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
        const networkState = await NetInfo.fetch();
        const wifiDetails = {
        "SSID": networkState.details?.ssid,
        "User": "TestUSER",
        "Pass": password,
        "UUID": cameraUUID
        }
        const base64WifiDetails = window.btoa(JSON.stringify(wifiDetails));
        console.log(base64WifiDetails);
        console.log(await deviceDiscovered.writeCharacteristicWithResponseForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.WIFI_UUID, base64WifiDetails));
    }
    catch(error) {
        console.log('Error in writeCameraWifi()', error);
    }
}

/**
 * This method will check the EyeSpy Connection notification.  It will say
 * if the camera has connected to the wifi connection or not.
 * @param device 
 */
export async function checkCameraNotification(device: Device): Promise<void> {

    const onCameraNotificationUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
        console.error(error);
          return;
        }
        if (characteristic?.value) {
        console.error('No Characteristic Found');
        }
    }


    const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
    deviceDiscovered.monitorCharacteristicForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.CONNECTION_UUID, onCameraNotificationUpdate)
}