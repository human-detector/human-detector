import { BleError, Characteristic, Device, Subscription, BleManager } from 'react-native-ble-plx';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import * as EyeSpyUUID from '../../config/BLEConfig';
import { base64ToJson, isDuplicateDevice, jsonToBase64, postBLEAlert } from './helpers';

/**
 * This file includes all of the camera bluetooth services that the mobile app
 * will need to connect to.
 */

export interface CameraSerial {
  Serial: string;
  PubKey: string;
}

export enum WifiSecType {
  WPA2_802_1X = 'KEY_802_1X',
  WPA2_PSK = 'KEY_PSK',
  OPEN = 'OPEN',
  UNSUPPORTED = 'UNSUPPORTED',
  UNKNOWN = '',
}

/**
 * BLE Notification
 */

export enum ConnectionStatus {
  INTERNAL_ERROR = 0,
  DISCONNECTED = 1,
  CONNECTING = 2,
  SUCCESS = 3,
  FAIL = 4,
  ATTEMPTING_PING = 5,
}

export enum FailReason {
  NONE = 0,
  NETWORK_NOT_FOUND = 1,
  INCORRECT_SECRETS = 2,
  FORBIDDEN = 3,
  BACKEND_DOWN = 4,
}

// Notification JSON recieved from camera
export interface ConnectionNotification {
  State: ConnectionStatus;
  Reason: number;
}

export type NotificationCallback = (
  error: BleError | null,
  notif: ConnectionNotification | null
) => Promise<void>;

export class BLEService {
  private connectedDevice: Device | null = null;

  private devices: Device[] = [];

  private bleManager;

  constructor(manager: BleManager) {
    this.bleManager = manager;
  }

  /**
   * scanForDevices will start scanning for BLE connections.  It will make it so it only
   * scans for our specific devices.  It will also add it to a list which can be displayed to the user.
   */
  public scanForDevices(callback: (devices: Device[]) => void) {
    // EyeSpyUUID.BLE_SERVICE_UUID
    this.bleManager.startDeviceScan([], null, (error, device) => {
      if (error) {
        console.error(error.message);
        postBLEAlert(error);
      }

      if (device) {
        // Add Device
        if (!isDuplicateDevice(this.devices, device)) {
          this.devices = [...this.devices, device];
          callback(this.devices);
        }
      }
    });
  }

  /**
   * Stop scanning for new devices
   */
  public stopScanForDevices() {
    this.devices = [];
    this.bleManager.stopDeviceScan();
  }

  /**
   * Returns all scanned devices found
   *
   * @returns Array of scanned devices
   */
  public getDevices() {
    return this.devices;
  }

  /**
   * Currently connected device
   *
   * @returns Device
   */
  public getCurrentConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * This method will connect to a specified device and set it
   * as the currentDevice
   * @param device
   */
  public async connectToDevice(device: Device) {
    if (await device.isConnected()) return;
    const deviceConnection = await device.connect();
    this.connectedDevice = await deviceConnection.discoverAllServicesAndCharacteristics();
  }

  /**
   * Disconnect from current device
   */
  public async disconnectFromDevice() {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
    }
  }

  /**
   * getCameraSerialFromBLE will read the Eyespy Serial
   * @param device
   * @returns Returns camera serial and BLE
   */
  public async getCameraSerialFromBLE(): Promise<CameraSerial> {
    // Get EyeSpy serial characteristic
    const characteristic: Characteristic = await this.connectedDevice!.readCharacteristicForService(
      EyeSpyUUID.BLE_SERVICE_UUID,
      EyeSpyUUID.SERIAL_UUID
    );

    if (!characteristic.value) throw new Error('ERROR: No value in characteristic!');

    const serialValues = base64ToJson(characteristic.value);

    if (!serialValues.Serial || !serialValues.PubKey) throw new Error('ERROR: No serial value!');

    // Get characteristic values (Serial values)
    const { Serial, PubKey } = serialValues;
    return {
      Serial,
      PubKey,
    };
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

    const base64WifiDetails = jsonToBase64(wifiDetails);
    await this.connectedDevice!.writeCharacteristicWithResponseForService(
      EyeSpyUUID.BLE_SERVICE_UUID,
      EyeSpyUUID.WIFI_UUID,
      base64WifiDetails
    );
  }

  /**
   * Checks the wifi type using the SSID phone is currently connected to
   * @returns Wifi Security Type
   */
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
      const base64SSID = jsonToBase64(bleSendSSID);
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

      if (!checkChar.value)
        throw new Error('ERROR: No value in checkChar.value in checkWifiType()!');

      const wifiTypeJson: { Type: WifiSecType } = base64ToJson(checkChar.value);
      return wifiTypeJson.Type;
    } catch (error) {
      console.error('Error in checkWifiType(): ', error);
      throw error;
    }
  }

  /**
   * This method will check the EyeSpy Connection notification.  It will say
   * if the camera has connected to the wifi connection or not.
   * @param device
   */
  public async checkCameraNotification(
    onCameraNotificationUpdate: NotificationCallback
  ): Promise<Subscription> {
    const bleCallback = (error: BleError | null, characteristic: Characteristic | null): void => {
      let returnVal: ConnectionNotification | null = null;
      if (error === null && characteristic?.value != null) {
        returnVal = base64ToJson(characteristic.value);
      }

      onCameraNotificationUpdate(error, returnVal);
    };

    return this.connectedDevice!.monitorCharacteristicForService(
      EyeSpyUUID.BLE_SERVICE_UUID,
      EyeSpyUUID.CONNECTION_UUID,
      bleCallback
    );
  }
}
