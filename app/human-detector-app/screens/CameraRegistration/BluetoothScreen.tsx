import * as React from 'react';
import { View, ScrollView, Button } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { BLEContext } from '../../contexts/bleContext';
import { requestPermissions } from '../../src/ble/helpers'


/**
 * This screen will start scanning on the device for bluetooth devices.
 * It will display a list of th ebluetooth devices that can be detected from the app.  The
 * visible cameras will be specific to EyeSpy cameras.
 * Clicking on a button will connect the mobile app to the bluetooth device, and then navigate to
 * the EnterCameraRegionInfoScreen.
 * @returns
 */

export default function BluetoothScreen({ navigation }): React.ReactElement {
  const [allDevices, setAllDevices] = React.useState<Device[]>([]);
  const [device, setDevice] = React.useState<Device | null>(null);
  const bleService = React.useContext(BLEContext);

  React.useEffect(() => {
    setAllDevices(bleService.getDevices());
  }, [bleService.getDevices()]);

  React.useEffect(() => {
    requestPermissions().then((isGranted: boolean) => {
      if (isGranted) {
        bleService.scanForDevices(setAllDevices);
      }
    });
  }, []);
  
  React.useEffect(() => {
    if (device) {
      // User has connected to a device
      device.isConnected().then((connected) => {
        if (connected) navigation.navigate('CameraRegistrationInfo');
      });
  
      console.log('Camera is not connected!');
    }
  }, [device]);
  

  return (
    <View>
      <ScrollView>
        {allDevices.map((item) => (
          <View key={item.id}>
            <Button
              title={item.id}
              onPress={() => {
                // This button will connect device
                bleService.connectToDevice(item).then(() => {
                  setDevice(item);
                });
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
