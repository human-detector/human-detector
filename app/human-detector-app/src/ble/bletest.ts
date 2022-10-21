import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import { useState } from 'react';

type PermissionCallback = (result: boolean) => void;

const bleManager = new BleManager();

interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  connectToDevice(device: Device): Promise<void>;
  scanForDevices(): void;
  currentDevice: Device | null;
  heartRate: number;
  allDevices: Device[];
}

export default function useBLE(): BluetoothLowEnergyApi {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [currentDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);

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

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForDevices = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes(' ')) {
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

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      bleManager.stopDeviceScan();
    } catch (error) {
      console.log('ERROR WHEN CONNECTING', error);
    }
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService('UUID', 'CAMERA_CHARACTERISTIC', () => {});
    } else {
      console.error('NO DEVICE CONNECTED');
    }
  };

  const onHeartRateUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.error(error);
      return;
    }
    if (characteristic?.value) {
      console.error('No Characteristic Found');
    }

    const rawData = characteristic?.value;
    console.log(rawData);
  };

  return {
    requestPermissions,
    connectToDevice,
    scanForDevices,
    currentDevice,
    heartRate,
    allDevices,
  };
}
