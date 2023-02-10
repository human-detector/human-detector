import { useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { View, Text } from 'react-native';
import { EventArg } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BleError, Subscription, BleErrorCode } from 'react-native-ble-plx';
import { LoadingIcon, LoadingState } from '../../components/LoadingIcon';
import { ConnectionStatus, ConnectionNotification, FailReason } from '../../src/ble/bleServices';
import { BLEContext } from '../../contexts/bleContext';
import { BLEParamList } from '../../src/navigation/bleParamList';
import { UserContext } from '../../contexts/userContext';
import { styles } from '../../src/styles';
import { BackendContext } from '../../contexts/backendContext';

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
  const [loadingEnded, setLoadingEnded] = useState<Boolean>(false);

  const backendContext = useContext(BackendContext);
  const bleContext = useContext(BLEContext);
  const userContext = useContext(UserContext);
  const currentDevice = bleContext.getCurrentConnectedDevice();

  const {groupId, cameraId} = route.params;

  if (!backendContext) {
    throw new Error('Backend context is null');
  }
  if (!userContext) {
    throw new Error('user context is null');
  }

  const endLoading = (failure: boolean) => {
    setLoadingEnded(true);
    bleSub!.remove();
    bleContext.disconnectFromDevice();
    setTimeout(() => {
      navigation.navigate(failure ? 'CameraRegistrationInfo' : 'BluetoothDeviceList');
    }, END_LOGGING_TIMEOUT);
  };

  useEffect(() => {
    if (connState === undefined) return;

    switch (connState.State) {
      case ConnectionStatus.DISCONNECTED:
        setConnString('Disconnected from old WiFi');
        break; // Do nothing
      case ConnectionStatus.CONNECTING:
        setIcon(LoadingState.Loading);
        setConnString('Connecting to WiFi');
        break;
      case ConnectionStatus.FAIL:
        setIcon(LoadingState.Failure);
        userContext.groupList.pop();
        setConnString(`Failure!\n${FailReason[connState.Reason]}`);
        backendContext.deleteCameraAPI(groupId, cameraId);
        endLoading(true);
        break;
      case ConnectionStatus.SUCCESS:
        setIcon(LoadingState.Success);
        setConnString('Success!');
        endLoading(false);
        break;
      case ConnectionStatus.ATTEMPTING_PING:
        setConnString('Attempting to contact Backend');
        break;
      default:
        endLoading(false);
        console.error('UNKNOWN STATE!');
        break;
    }
  }, [connState]);

  // gestureEnabled only works on iOS, so this is needed here to
  // actually disable going back on Android
  useEffect(() => {
    const backListener = (e: EventArg<'beforeRemove', true, any>) => {
      if (!loadingEnded) {
        e.preventDefault();
      }
    };

    navigation.addListener('beforeRemove', backListener);
    return () => navigation.removeListener('beforeRemove', backListener);
  }, [navigation, loadingEnded]);

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
