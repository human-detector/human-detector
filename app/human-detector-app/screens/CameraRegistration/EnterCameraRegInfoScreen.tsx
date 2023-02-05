import * as React from 'react';
import { View, TextInput, Button, KeyboardAvoidingView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WifiSecType, CameraSerial } from '../../src/ble/bleServices';
import { BackendContext } from '../../contexts/backendContext';
import { BLEContext } from '../../contexts/bleContext';
import { BLEParamList } from '../../src/navigation/bleParamList';
import { UserContext } from '../../contexts/userContext';
import Camera from '../../classes/Camera';
import { styles } from '../../src/styles';

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
  const userContext = React.useContext(UserContext);
  const currentDevice = bleContext.getCurrentConnectedDevice();

  if (!userContext) {
    throw new Error('user context is null!');
  }

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

        const groupObj = userContext.getGroupFromId(groupId);
        if (groupObj === undefined) {
          console.error(`Group with id" ${groupId} " was not found.`);
          return;
        } // verifying that the cameraName isn't already used in this group
        groupObj.cameras.forEach(camera => {
          if (camera.cameraName === cameraName) {
            Alert.alert('Error: You cannot use the same name for a camera more than once.');
            console.error(`cameraName was used more than once called: ${cameraName}`);
            navigation.goBack();
            return;
          }          
      })

        // begins work on registering the camera
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
        const newCam = new Camera(cameraName, uuid, []);

        userContext.getGroupFromId(groupId)?.cameras.push(newCam);
        navigation.navigate('Loading', { groupId, cameraId: uuid });
        userContext.cameraMap.set(newCam.cameraId, newCam);

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
      })
      .catch((error) => {
        console.error(error);
        navigation.navigate('BluetoothDeviceList');
      });
  }, [currentDevice]);

  return (
    <KeyboardAvoidingView style={styles.regContainer}>
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
      <View style={styles.button}>
        <Button title="Next" onPress={submitWifiToPi} />
      </View>
    </KeyboardAvoidingView>
  );
}
