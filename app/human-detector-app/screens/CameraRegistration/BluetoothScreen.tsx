import * as React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Device } from 'react-native-ble-plx';
import { enc } from 'crypto-js';
import { LoadingIcon, LoadingState } from '../../components/LoadingIcon';
import { BLEParamList } from '../../src/navigation/bleParamList';
import { BLEContext } from '../../contexts/bleContext';
import { requestPermissions } from '../../src/ble/helpers';
import { styles } from '../../src/styles';

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

  function getTitle(device: Device): string {
    if (device.manufacturerData == null) return 'Invalid Device';
    const base64CryptoWord = enc.Base64.parse(device.manufacturerData);
    const hexStr = base64CryptoWord.toString(enc.Hex);

    const bytes = [];
    for (let i = hexStr.length; i > 0; i -= 2) {
      bytes.push(parseInt(hexStr.substring(i - 2, i), 16));
    }

    if (bytes.length < 2 || bytes[bytes.length - 1] !== 0xff || bytes[bytes.length - 2] !== 0xff)
      return 'Invalid manufacturer';

    let val = 0;
    for (let i = 0; i < bytes.length - 2; i += 1) {
      val *= 0x100;
      val += bytes[i];
    }

    return `${device.name} - ${val.toString(16)}`;
  }

  useFocusEffect(() => {
    requestPermissions().then((isGranted: boolean) => {
      if (isGranted) {
        try {
          bleService.scanForDevices(setAllDevices);
        } catch (err) {
          console.log('test');
        }
      } else {
        Alert.alert(
          'Please allow location permissions for the app. This allows you to connect your camera to your mobile device.'
        );
      }
    });

    // return () => {
    //   bleService.stopScanForDevices();
    // }
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Text style={styles.registerCamText}>
          {' '}
          To register a camera, click on the desired camera in the list below This list will update
          automatically.{' '}
        </Text>
        {allDevices
          .filter((dev) => dev.manufacturerData != null)
          .map((item) => (
            <View key={item.manufacturerData}>
              <TouchableOpacity
                style={styles.registerCamButton}
                onPress={() => {
                  if (connecting) return;
                  setConnecting(true);

                  // This button will connect device
                  bleService
                    .connectToDevice(item)
                    .then(() => {
                      // Connecting to camera was successful, so stop scanning
                      setConnecting(false);
                      bleService.stopScanForDevices();
                      navigation.navigate('CameraRegistrationInfo');
                    })
                    .catch((error) => {
                      console.error(error);
                      setConnecting(false);
                    });
                }}
              >
                <Text style={styles.registerCamButtonText}> {getTitle(item)} </Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
      {connecting && <LoadingIcon state={LoadingState.Loading} background />}
    </View>
  );
}
