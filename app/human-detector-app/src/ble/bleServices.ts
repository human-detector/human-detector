import { enc, lib } from 'crypto-js';
import { BleError, Characteristic, Device, Subscription, BleManager } from 'react-native-ble-plx';
import NetInfo from '@react-native-community/netinfo';
import * as EyeSpyUUID from '../../config/BLEConfig';

type PermissionCallback = (result: boolean) => void;

/**
 * This file includes all of the camera bluetooth services that the mobile app
 * will need to connect to.
 */

export interface CameraSerial {
  Serial: string;
  PubKey: string;
}

export enum WifiSecType {
  WPA2_802_1X = "KEY_802_1X",
  WPA2_PSK = "KEY_PSK",
  OPEN = "OPEN",
  UNSUPPORTED = "UNSUPPORTED",
  UNKNOWN = "",
}

function isDuplicateDevice(devices: Device[], nextDevice: Device) {
  return devices.findIndex((device) => nextDevice.id === device.id) > -1;
}

export class BLEService {
  private connectedDevice: Device | null = null;

  private devices: Device[] = [];

  private bleManager = new BleManager();

  /**
   * scanForDevices will start scanning for BLE connections.  It will make it so it only
   * scans for our specific devices.  It will also add it to a list which can be displayed to the user.
   */
  public scanForDevices(callback) {
    this.bleManager.startDeviceScan([EyeSpyUUID.BLE_SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.log(error.errorCode);
      }
      if (device) {
        // Add Device
        if (!isDuplicateDevice(this.devices, device)) {
          callback([...this.devices, device]);
          this.devices =  [...this.devices, device];
        }
      }
    });
  };

  public getDevices() {
    return this.devices;
  }

  public getCurrentConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * This method will connect to a specified device and set it
   * as the currentDevice
   * @param device
   */
  public async connectToDevice(device: Device) {
    try {
      const deviceConnection = await device.connect();
      this.connectedDevice = await deviceConnection.discoverAllServicesAndCharacteristics();
      this.bleManager.stopDeviceScan();
    } catch (error) {
      console.log('ERROR WHEN CONNECTING', error);
    }
  };

  /**
   * getCameraSerialFromBLE will read the Eyespy Serial
   * @param device
   * @returns Returns camera serial and BLE
   */
  public async getCameraSerialFromBLE(): Promise<CameraSerial> {
    // Get EyeSpy serial characteristic
    try {
      console.log(this.connectedDevice);
      const characteristic: Characteristic = await this.connectedDevice!.readCharacteristicForService(
        EyeSpyUUID.BLE_SERVICE_UUID,
        EyeSpyUUID.SERIAL_UUID
      );

      if (!characteristic.value) throw new Error('ERROR: No value in characteristic!');

      const serialValues = JSON.parse(enc.Base64.parse(characteristic.value).toString(enc.Utf8));

      if (!serialValues.Serial || !serialValues.PubKey) throw new Error('ERROR: No serial value!');

      // Get characteristic values (Serial values)
      const { Serial, PubKey } = serialValues;
      return {
        Serial,
        PubKey,
      };
    } catch (error) {
      console.log('NO DEVICE CONNECTED', error.reason);
      throw error;
    }
  }

  
  /**
   * This method will write to the write to EyeSpy Wifi to write
   * @param device
   */
  public async writeCameraWifi(
    username: string,
    password: string,
    cameraUUID: string
  ): Promise<void> {
    try {

      const networkState = await NetInfo.fetch();

      if (!networkState.details?.ssid)
        throw new Error(
          'ERROR: SSID Could not be found. Make sure location permissions are turned on!'
        );

      const wifiDetails = {
        SSID: networkState.details?.ssid,
        User: username,
        Pass: password,
        UUID: cameraUUID,
      };
      const base64WifiDetails = enc.Base64.stringify(enc.Utf8.parse(JSON.stringify(wifiDetails)));
      console.log(JSON.stringify(wifiDetails));
      console.log(wifiDetails);
      console.log(base64WifiDetails);
      console.log(
        await this.connectedDevice!.writeCharacteristicWithResponseForService(
          EyeSpyUUID.BLE_SERVICE_UUID,
          EyeSpyUUID.WIFI_UUID,
          base64WifiDetails
        )
      );
    } catch (error) {
      console.log('Error in writeCameraWifi()', error);
    }
  }

  public async checkWifiType(): Promise<WifiSecType> {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.details?.ssid)
        throw new Error(
          'ERROR: SSID Could not be found. Make sure location permissions are turned on!'
        );
      const bleSendSSID = {
        SSID: networkState.details?.ssid,
      };
      const base64SSID = enc.Base64.stringify(enc.Utf8.parse(JSON.stringify(bleSendSSID)));
      this.connectedDevice!.writeCharacteristicWithResponseForService(
        EyeSpyUUID.BLE_SERVICE_UUID,
        EyeSpyUUID.WIFI_CHECK_UUID,
        base64SSID
      );

      // After writing, we should read the characteristic
      const checkChar = await this.connectedDevice!.readCharacteristicForService(
        EyeSpyUUID.BLE_SERVICE_UUID,
        EyeSpyUUID.WIFI_CHECK_UUID
      );

      if (!checkChar.value) throw new Error('ERROR: No value in checkChar.value in checkWifiType()!');

      const wifiTypeJson: {Type: WifiSecType} = JSON.parse(enc.Base64.parse(checkChar.value).toString(enc.Utf8));
      return wifiTypeJson.Type;
    } catch (error) {
      console.log('Error in checkWifiType(): ', error);
      throw error;
    }
  }

  /**
   * This method will check the EyeSpy Connection notification.  It will say
   * if the camera has connected to the wifi connection or not.
   * @param device
   */
  public async checkCameraNotification(
    onCameraNotificationUpdate: (
      error: BleError | null,
      characteristic: Characteristic | null
    ) => Promise<void>
  ): Promise<Subscription> {
    return this.connectedDevice!.monitorCharacteristicForService(
      EyeSpyUUID.BLE_SERVICE_UUID,
      EyeSpyUUID.CONNECTION_UUID,
      onCameraNotificationUpdate
    );
  }
}