import { useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { View } from 'react-native';
import { enc } from 'crypto-js';
import { BleError, Characteristic, Subscription } from 'react-native-ble-plx';
import { LoadingIcon, LoadingState } from '../../components/LoadingIcon';
import { ConnectionNotification, ConnectionStatus } from '../../src/ble/bleServices';
import { BLEContext } from '../../contexts/bleContext';

const END_LOGGING_TIMEOUT = 3 * 1000;

/**
 * The LoadingScreen screen will display when a user is waiting for something.
 * The original primary use for this screen is for when the user is waiting for
 * a successful connection notifciation from the camera.
 */
export default function LoadingScreen({ navigation }): React.ReactElement {
  const [ bleSub, setBleSub ] = useState<Subscription>();
  const [ icon, setIcon ] = useState<LoadingState>(LoadingState.Loading);

  const bleContext = useContext(BLEContext);
  const currentDevice = bleContext.getCurrentConnectedDevice();

  useEffect(() => {
    if (currentDevice === null)
      return;

    const endLoading = (nextScreen: string) => {
      bleSub?.remove();
      setTimeout(() => {
        navigation.navigate(nextScreen);
      }, END_LOGGING_TIMEOUT);
    }

    const bleCallback = async (error: BleError | null, char: Characteristic | null) => {
      if (error !== null || char === null) {
        // Error occured
        console.error(error);
      } else {
        if (!char.value) {
          throw new Error('ERROR: No value in characteristic!');
        }
  
        const notifValues = JSON.parse(enc.Base64.parse(char.value).toString(enc.Utf8));
        
        console.log(notifValues.State);
        switch(notifValues.State) {
          case ConnectionStatus.DISCONNECTED:
            break; // Do nothing
          case ConnectionStatus.CONNECTING:
            setIcon(LoadingState.Loading);
            break;
          case ConnectionStatus.FAIL:
            setIcon(LoadingState.Failure);
            endLoading('EnterCmaeraRegInfoScreen');
            break;
          case ConnectionStatus.SUCCESS:
            setIcon(LoadingState.Success);
            endLoading('Groups');
            break;
          default:
            console.error("UNKNOWN STATE!");
            break;
        }
      }
    }
    
    // When a new device is detected, monitor for network connection statuses
    bleContext.checkCameraNotification(bleCallback).then((sub: Subscription) => {
      // Save off subscription so that we can cancel monitoring later
      setBleSub(sub);
    }).catch((error) => {
      console.error(error);
      endLoading('Bluetooth');
    });
  }, []);

  return (
    <View>
      <LoadingIcon state={icon}/>
    </View>
  );
}
