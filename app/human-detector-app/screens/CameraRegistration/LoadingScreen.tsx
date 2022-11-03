import { useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BleError, Subscription, BleErrorCode } from 'react-native-ble-plx';
import { LoadingIcon, LoadingState } from '../../components/LoadingIcon';
import { ConnectionStatus, ConnectionNotification } from '../../src/ble/bleServices';
import { BLEContext } from '../../contexts/bleContext';
import { BLEParamList } from '../../src/navigation/bleParamList';

const END_LOGGING_TIMEOUT = 3 * 1000;

/**
 * The LoadingScreen screen will display when a user is waiting for something.
 * The original primary use for this screen is for when the user is waiting for
 * a successful connection notifciation from the camera.
 */

type Props = NativeStackScreenProps<BLEParamList, 'Loading'>
export default function LoadingScreen({ navigation }: Props): React.ReactElement {
  const [ connState, setConnState] = useState<ConnectionNotification>();
  const [ bleSub, setBleSub ] = useState<Subscription>();
  const [ icon, setIcon ] = useState<LoadingState>(LoadingState.Loading);

  const bleContext = useContext(BLEContext);
  const currentDevice = bleContext.getCurrentConnectedDevice();

  const endLoading = (failure:boolean) => {
    bleSub!.remove();
    bleContext.disconnectFromDevice();
    setTimeout(() => {
      navigation.navigate(failure ? 'CameraRegistrationInfo' : 'BluetoothDeviceList');
    }, END_LOGGING_TIMEOUT);
  }

  useEffect(() => {
    if (connState === undefined) return;

    switch(connState.State) {
      case ConnectionStatus.DISCONNECTED:
        break; // Do nothing
      case ConnectionStatus.CONNECTING:
        setIcon(LoadingState.Loading);
        break;
      case ConnectionStatus.FAIL:
        setIcon(LoadingState.Failure);
        endLoading(true);
        break;
      case ConnectionStatus.SUCCESS:
        setIcon(LoadingState.Success);
        endLoading(false);
        break;
      default:
        endLoading(false);
        console.error("UNKNOWN STATE!");
        break;
    }
  }, [connState]);

  useEffect(() => {
    if (currentDevice === null)
      return;

    const bleCallback = async (
      error: BleError | null,
      notif: ConnectionNotification | null
    ) => {
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
    }
    
    // When a new device is detected, monitor for network connection statuses
    bleContext.checkCameraNotification(bleCallback).then((sub: Subscription) => {
      // Save off subscription so that we can cancel monitoring later
      setBleSub(sub);
    }).catch((error) => {
      console.error(error);
      navigation.navigate('BluetoothDeviceList');
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LoadingIcon state={icon}/>
    </View>
  );
}
