import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { useState } from 'react';
import * as EyeSpyUUID from '../../config/BLEConfig';

type PermissionCallback = (result: boolean) => void;

const bleManager = new BleManager();

interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  connectToDevice(device: Device): Promise<void>;
  scanForDevices(): void;
  currentDevice: Device | null;
  allDevices: Device[];
}

export default function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [currentDevice, setConnectedDevice] = useState<Device | null>(null);
  // const [heartRate, setHeartRate] = useState<number>(0);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
  devices.findIndex((device) => nextDevice.id === device.id) > -1;

  /**
   * requestPermissions will ask the user to allow location permission
   * on their device
   * @param callback 
   */
  const requestPermissions = async (callback: PermissionCallback) => {
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
      callback(grantedStatus === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      callback(true);
    }
  };

  /**
   * scanForDevices will start scanning for BLE connections.  It will make it so it only
   * scans for our specific devices.  It will also add it to a list which can be displayed to the user.
   */
  const scanForDevices = () => {
    bleManager.startDeviceScan([EyeSpyUUID.BLE_SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        // Add Device
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

  /**
   * This method will connect to a specified device and set it
   * as the currentDevice
   * @param device 
   */
  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await device.connect();
      setConnectedDevice(deviceConnection);
      bleManager.stopDeviceScan();
    } catch (error) {
      console.log('ERROR WHEN CONNECTING', error);
    }
  };

  return {
    requestPermissions,
    connectToDevice,
    scanForDevices,
    currentDevice,
    allDevices,
  };
}
