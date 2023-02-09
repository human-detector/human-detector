import { useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BleError, Subscription, BleErrorCode } from 'react-native-ble-plx';
import { LoadingIcon, LoadingState } from '../../components/LoadingIcon';
import { ConnectionStatus, ConnectionNotification, FailReason } from '../../src/ble/bleServices';
import { BLEContext } from '../../contexts/bleContext';
import { BLEParamList } from '../../src/navigation/bleParamList';
import { UserContext } from '../../contexts/userContext';
import { styles } from '../../src/styles';
import { BackendContext } from '../../contexts/backendContext';
import Camera from '../../classes/Camera';

const END_LOGGING_TIMEOUT = 3 * 1000;

/**
 * The LoadingScreen screen will display when a user is waiting for something.
 * The original primary use for this screen is for when the user is waiting for
 * a successful connection notifciation from the camera.
 */

type Props = NativeStackScreenProps<BLEParamList, 'Loading'>;
export default function LoadingScreen({ navigation, route }: Props): React.ReactElement {
  const [connState, setConnState] = useState<ConnectionNotification>();
  const [bleSub, setBleSub] = useState<Subscription>();
  const [connString, setConnString] = useState<String>('Connecting to WiFi');
  const [icon, setIcon] = useState<LoadingState>(LoadingState.Loading);

  const backendContext = useContext(BackendContext);
  const bleContext = useContext(BLEContext);
  const userContext = useContext(UserContext);
  const currentDevice = bleContext.getCurrentConnectedDevice();

  const {groupId, cameraId, user, pass, name} = route.params;

  if (!backendContext) {
    throw new Error('Backend context is null');
  }
  if (!userContext) {
    throw new Error('user context is null');
  }

  const endLoading = () => {
    bleSub!.remove();
    bleContext.disconnectFromDevice();
    setTimeout(() => {
      navigation.navigate('BluetoothDeviceList');
    }, END_LOGGING_TIMEOUT);
  };

  const addCamera = () => {
    const newCam = new Camera(name, cameraId, []);
    userContext.getGroupFromId(groupId)?.cameras.push(newCam);
    userContext.cameraMap.set(newCam.cameraId, newCam);
  }

  useEffect(() => {
    if (connState === undefined) return;

    switch (connState.State) {
      case ConnectionStatus.DISCONNECTED:
        // Do nothing. This usually occurs after a Fail, so isn't important
        // This also is the first thing sent usually, but is quickly replaced by
        // connecting.
        break;
      case ConnectionStatus.CONNECTING:
        setIcon(LoadingState.Loading);
        setConnString('Connecting to WiFi');
        break;
      case ConnectionStatus.FAIL:
        setIcon(LoadingState.Failure);
        setConnString(`Failure!\n${FailReason[connState.Reason]}`);
        backendContext.deleteCameraAPI(groupId, cameraId);
        endLoading();
        break;
      case ConnectionStatus.SUCCESS:
        // ESLint doesn't like variable declerations here :(
        addCamera(name, cameraId, groupId);
        setIcon(LoadingState.Success);
        setConnString('Success!');
        endLoading();
        break;
      case ConnectionStatus.ATTEMPTING_PING:
        setConnString('Attempting to contact Backend');
        break;
      default:
        endLoading();
        console.error('UNKNOWN STATE!');
        break;
    }
  }, [connState]);

  useEffect(() => {
    if (currentDevice === null) return;

    const bleCallback = async (error: BleError | null, notif: ConnectionNotification | null) => {
      if (error !== null || notif === null) {
        if (error?.errorCode === BleErrorCode.OperationCancelled) {
          // Operation was cancelled by us, do not do anything
          return;
        }

        console.error(error);
        navigation.navigate('BluetoothDeviceList');
      } else {
        setConnState(notif);
      }
    };

    // When a new device is detected, monitor for network connection statuses
    bleContext
      .checkCameraNotification(bleCallback)
      .then((sub: Subscription) => {
        // Save off subscription so that we can cancel monitoring later
        setBleSub(sub);
        
        // Write to camera after starting notifications, so that we don't miss
        // any fails that may occur soon after sending wifi details.
        bleContext.writeCameraWifi(user, pass, cameraId).catch((error) => {
          console.error(error);
          navigation.navigate('BluetoothDeviceList');
        });
      })
      .catch((error) => {
        console.error(error);
        navigation.navigate('BluetoothDeviceList');
      });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LoadingIcon state={icon} />
      <Text style={styles.cameraRegisteringText}>{connString}</Text>
    </View>
  );
}
