import * as React from 'react';
import { View, ScrollView, Button } from 'react-native';
import useBLE from '../../src/ble/bleConnect';
import { checkCameraNotification, getCameraSerialFromBLE, writeCameraWifi, checkWifiType, cameraListener } from '../../src/ble/bleServices';

let bool = false;

/**
 * This screen will start scanning on the device for bluetooth devices.
 * It will display a list of th ebluetooth devices that can be detected from the app.  The
 * visible cameras will be specific to EyeSpy cameras.
 * Clicking on a button will connect the mobile app to the bluetooth device, and then navigate to
 * the EnterCameraRegionInfoScreen.
 * @returns 
 */

export default function BluetoothScreen(): React.ReactElement {

    const {
        requestPermissions,
        connectToDevice,
        scanForDevices,
        currentDevice,
        allDevices,
      } = useBLE();
    
      requestPermissions((isGranted: boolean) => {
        if (isGranted) {
          if(!bool) {
            scanForDevices();
            bool = true;
          }
        }
      });
    
      console.log(allDevices);

      if(currentDevice) {
        console.log("The process has started.");
        checkCameraNotification(currentDevice, cameraListener);
        console.log(checkWifiType(currentDevice));
        getCameraSerialFromBLE(currentDevice);
        writeCameraWifi(currentDevice, "TestPass", "TestUUID");
        console.log(currentDevice);
      }

    return (
    <View>
        <ScrollView>
            {allDevices.map((item) => (
                <View key={item.id}>
                    <Button 
                    title={item.id}
                    onPress={() => {
                      connectToDevice(item);
                      }}/>
                </View>
            ))}
        </ScrollView>
    </View>
    )
}