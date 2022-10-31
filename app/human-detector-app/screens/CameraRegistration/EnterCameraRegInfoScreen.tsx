import * as React from 'react';
import { View, StyleSheet, TextInput, Button } from 'react-native';
import { checkWifiType, getCameraSerialFromBLE, WifiSecType, CameraSerial, writeCameraWifi } from '../../src/ble/bleServices';
import useBLE from '../../src/ble/bleConnect';
import { BackendContext } from '../../contexts/backendContext';

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
    // paddingTop: 40,
    // paddingHorizontal: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  pads: {
    padding: 10,
  },
  boldHeader: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  menuItem: {
    marginTop: 24,
    marginLeft: 20,
    marginRight: 20,
    padding: 30,
    backgroundColor: '#E0FFFF',
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#D3D3D3',
  },
  addButtonItem: {
    borderColor: '#D3D3D3',
    backgroundColor: '#DCDCDC',
  },
  menuButtonText: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    alignItems: 'center',
    fontSize: 50,
    marginTop: 0,
    marginBottom: 0,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  buttonNext: {},
});

export default function EnterCameraRegInfoScreen({ navigation }): React.ReactElement {
  const [displayUser, setDisplayUser] = React.useState(false);
  const [displayPass, setDisplayPass] = React.useState(false);
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');

  const { currentDevice } = useBLE();
  const context = React.useContext(BackendContext);

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
    
    getCameraSerialFromBLE(currentDevice).then(async (serial: CameraSerial) => {
      if (context === null) {
        console.error(`Backend services is null!`);
        return;
      }

      // TODO: Talk to server
      const uuid = await context.registerCamera(
        "Camera-A",
        serial.Serial,
        serial.PubKey,
        "GROUP UUID"
      );

      if (uuid === null) {
        navigation.navigate('Bluetooth');
        return;
      }

      writeCameraWifi(currentDevice, user, pass, uuid).catch((error) => {
        console.error(error);
        navigation.navigate('Bluetooth');
      });
      navigation.navigate('LoadingScreen');
    }).catch((error) => {
      console.error(error);
    });
  }

  React.useEffect(() => {
    console.log(currentDevice);
    if (currentDevice === null) {
      setDisplayPass(false);
      setDisplayUser(false);
      return;
    }

    checkWifiType(currentDevice).then((type: WifiSecType) => {
      setDisplayUser(type === WifiSecType.WPA2_802_1X);
      setDisplayPass(type === WifiSecType.WPA2_802_1X || type === WifiSecType.WPA2_PSK);

      // Open wifi connections need no user or pass, just try connecting
      if (type === WifiSecType.OPEN) {
        submitWifiToPi();
      }

    }).catch((error) => {
      console.error(error);
      navigation.navigate('Bluetooth');
    });
  }, [currentDevice]);

  return (
    <View style={styles.container}>
      {(displayUser) && <TextInput
        style={styles.input}
        onChangeText={setUser}
        value={user}
        placeholder="Enter WiFi username here"
      />}
      {(displayPass) && <TextInput
        style={styles.input}
        onChangeText={setPass}
        value={pass}
        placeholder="Enter WiFi password here"
      />}
      {(displayUser || displayPass) && <Button
        title="Next"
        onPress={submitWifiToPi}
      />}
    </View>
  );
}
