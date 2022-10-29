import * as React from 'react';
import { View, ScrollView, Button } from 'react-native';
import useBLE from '../../src/ble/bleConnect';
import {
  checkCameraNotification,
  getCameraSerialFromBLE,
  writeCameraWifi,
  checkWifiType,
  cameraListener,
} from '../../src/ble/bleServices';

let bool = false;

/**
 * This screen will start scanning on the device for bluetooth devices.
 * It will display a list of th ebluetooth devices that can be detected from the app.  The
 * visible cameras will be specific to EyeSpy cameras.
 * Clicking on a button will connect the mobile app to the bluetooth device, and then navigate to
 * the EnterCameraRegionInfoScreen.
 * @returns
 */

export default function BluetoothScreen({ navigation }): React.ReactElement {
  const { requestPermissions, connectToDevice, scanForDevices, currentDevice, allDevices } =
    useBLE();

  requestPermissions((isGranted: boolean) => {
    if (isGranted) {
      if (!bool) {
        scanForDevices();
        bool = true;
      }
    }
  });

  if (currentDevice) {
    // User has connected to a device
    currentDevice.isConnected().then((bool) => {
      if (bool) navigation.navigate('CameraRegistrationInfo');
    });

    console.log('Camera is not connected!');
  }

  return (
    <View>
      <ScrollView>
        {allDevices.map((item) => (
          <View key={item.id}>
            <Button
              title={item.id}
              onPress={() => {
                // This button will connect device
                connectToDevice(item);
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
