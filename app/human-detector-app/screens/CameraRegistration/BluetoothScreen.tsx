import * as React from 'react';
import { View, ScrollView, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Device } from 'react-native-ble-plx';
import { LoadingIcon, LoadingState } from '../../components/LoadingIcon';
import { BLEParamList } from '../../src/navigation/bleParamList';
import { BLEContext } from '../../contexts/bleContext';
import { requestPermissions } from '../../src/ble/helpers';

/**
 * This screen will start scanning on the device for bluetooth devices.
 * It will display a list of the bluetooth devices that can be detected from the app.  The
 * visible cameras will be specific to EyeSpy cameras.
 * Clicking on a button will connect the mobile app to the bluetooth device, and then navigate to
 * the EnterCameraRegionInfoScreen.
 * @returns
 */

type Props = NativeStackScreenProps<BLEParamList, 'BluetoothDeviceList'>;
export default function BluetoothScreen({ navigation }: Props): React.ReactElement {
  const [connecting, setConnecting] = React.useState(false);
  const [allDevices, setAllDevices] = React.useState<Device[]>([]);
  const bleService = React.useContext(BLEContext);

  useFocusEffect(() => {
    requestPermissions().then((isGranted: boolean) => {
      if (isGranted) {
        bleService.scanForDevices(setAllDevices);
      }
    });

    return () => {
      bleService.stopScanForDevices();
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {allDevices.map((item) => (
          <View key={item.id}>
            <Button
              title={item.id}
              onPress={() => {
                if (connecting) return;
                setConnecting(true);

                // This button will connect device
                bleService
                  .connectToDevice(item)
                  .then(() => {
                    setConnecting(false);
                    navigation.navigate('CameraRegistrationInfo');
                  })
                  .catch((error) => {
                    console.error(error);
                    setConnecting(false);
                  });
              }}
            />
          </View>
        ))}
      </ScrollView>
      {connecting && <LoadingIcon state={LoadingState.Loading} background />}
    </View>
  );
}
