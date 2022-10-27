import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import NetInfo from "@react-native-community/netinfo";
import { useState } from 'react';

type PermissionCallback = (result: boolean) => void;

const bleManager = new BleManager();

interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  connectToDevice(device: Device): Promise<void>;
  scanForDevices(): void;
  currentDevice: Device | null;
  allDevices: Device[];
  getCameraSerialFromBLE(device: Device): Promise<void>;
}

// Set EyeSpy BLE UUID's
const EYESPYBLESERVICEUUID = '4539d44c-75bb-4fbd-9d95-6cdf49d4ef2b';
const EYESPYWIFIUUID = '7a1673f9-55cb-4f40-b624-561ad8afb8e2';
const EYESPYSERIALUUID = '8b83fee2-373c-46a5-a782-1db9118431d9';
const EYESPYCONNECTIONUUID = '136670fb-f95b-4ee8-bc3b-81eadb234268';

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
    bleManager.startDeviceScan([EYESPYBLESERVICEUUID], null, (error, device) => {
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
   * getCameraSerialFromBLE will read the Eyespy Serial
   * @param device 
   */
  const getCameraSerialFromBLE = async (device: Device) => {
    // Get EyeSpy serial characteristic
    try {
      const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
      console.log(await deviceDiscovered.readCharacteristicForService(EYESPYBLESERVICEUUID, EYESPYSERIALUUID));
    }
    catch (error) {
      console.log('NO DEVICE CONNECTED', error);
    }
  }

  /**
   * This method will write to the write to EyeSpy Wifi to write
   * @param device 
   */
  const writeCameraWifi = async (device: Device): Promise<void> => {
    try {
      const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
      const wifiDetails = {
        "SSID": ss
      }
      console.log(await deviceDiscovered.writeCharacteristicWithResponseForService(EYESPYBLESERVICEUUID, EYESPYWIFIUUID));
    }
    catch(error) {
      console.log('Error in writeCameraWifi()', error);
    }
  }

  /**
   * This method will check the EyeSpy Connection notification.
   * @param device 
   */
  const checkCameraNotification = async (device: Device): Promise<void> => {

  }

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await device.connect();
      setConnectedDevice(deviceConnection);
      bleManager.stopDeviceScan();
    } catch (error) {
      console.log('ERROR WHEN CONNECTING', error);
    }
  };



  // const startStreamingData = async (device: Device) => {
  //   if (device) {
  //     device.monitorCharacteristicForService('UUID', 'CAMERA_CHARACTERISTIC', () => {});
  //   } else {
  //     console.error('NO DEVICE CONNECTED');
  //   }
  // };

  // const onHeartRateUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
  //   if (error) {
  //     console.error(error);
  //     return;
  //   }
  //   if (characteristic?.value) {
  //     console.error('No Characteristic Found');
  //   }

    // const rawData = characteristic?.value;
    // console.log(rawData);
  // };

  return {
    requestPermissions,
    connectToDevice,
    scanForDevices,
    currentDevice,
    allDevices,
    getCameraSerialFromBLE,
  };
}
