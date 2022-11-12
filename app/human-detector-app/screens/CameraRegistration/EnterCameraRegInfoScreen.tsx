import * as React from 'react';
import { View, StyleSheet, TextInput, Button, KeyboardAvoidingView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WifiSecType, CameraSerial } from '../../src/ble/bleServices';
import { BackendContext } from '../../contexts/backendContext';
import { BLEContext } from '../../contexts/bleContext';
import { BLEParamList } from '../../src/navigation/bleParamList';

/**
 * The EnterCameraRegInfoScreen will allow the user
 * to enter the information that they will need for the mobile app camera registration.
 * This information includes:
 *  WIFI Password,
 *  User
 *  Camera Name
 *
 * The camera reg info screen will be determined by what information the camera
 * will need for WiFi.
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  input: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    marginTop: 20,
  },
});

type Props = NativeStackScreenProps<BLEParamList, 'CameraRegistrationInfo'>;
export default function EnterCameraRegInfoScreen({ navigation, route }: Props): React.ReactElement {
  const [displayUser, setDisplayUser] = React.useState(false);
  const [displayPass, setDisplayPass] = React.useState(false);
  const [cameraName, setCameraName] = React.useState('');
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');

  const { groupId } = route.params;

  const backendContext = React.useContext(BackendContext);
  const bleContext = React.useContext(BLEContext);
  const currentDevice = bleContext.getCurrentConnectedDevice();

  const submitWifiToPi = () => {
    if (currentDevice === null) return;

    if (displayPass && pass === '') {
      // TODO: Display error
      return;
    }

    if (displayUser && user === '') {
      // TODO: Display error
      return;
    }

    bleContext
      .getCameraSerialFromBLE()
      .then(async (serial: CameraSerial) => {
        if (backendContext === null) {
          console.error(`Backend services is null!`);
          return;
        }

        // TODO: Talk to server
        const uuid = await backendContext.registerCamera(
          cameraName,
          serial.Serial,
          serial.PubKey,
          groupId
        );

        if (uuid === null) {
          navigation.navigate('BluetoothDeviceList');
          return;
        }

        bleContext.writeCameraWifi(user, pass, uuid).catch((error) => {
          console.error(error);
          navigation.navigate('BluetoothDeviceList');
        });
        navigation.navigate('Loading');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  React.useEffect(() => {
    if (currentDevice === null) {
      setDisplayPass(false);
      setDisplayUser(false);
      return;
    }

    bleContext
      .checkWifiType()
      .then((type: WifiSecType) => {
        setDisplayUser(type === WifiSecType.WPA2_802_1X);
        setDisplayPass(type === WifiSecType.WPA2_802_1X || type === WifiSecType.WPA2_PSK);

        // Open wifi connections need no user or pass, just try connecting
        if (type === WifiSecType.OPEN) {
          submitWifiToPi();
        }
      })
      .catch((error) => {
        console.error(error);
        navigation.navigate('BluetoothDeviceList');
      });
  }, [currentDevice]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setCameraName}
        value={cameraName}
        placeholder="Enter camera name here"
      />
      {displayUser && (
        <TextInput
          style={styles.input}
          onChangeText={setUser}
          value={user}
          placeholder="Enter WiFi username here"
        />
      )}
      {displayPass && (
        <TextInput
          style={styles.input}
          onChangeText={setPass}
          value={pass}
          secureTextEntry
          placeholder="Enter WiFi password here"
        />
      )}
      {(displayUser || displayPass) && (
        <View style={styles.button}>
          <Button title="Next" onPress={submitWifiToPi} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
