import * as React from 'react';
import { View, Text, ScrollView, Button, Alert } from 'react-native';
import useBLE from '../src/ble/bletest';

let bool = false;

export default function BluetoothScreen(): React.ReactElement {

    const {
        requestPermissions,
        connectToDevice,
        scanForDevices,
        currentDevice,
        allDevices,
        getCameraSerialFromBLE,
      } = useBLE();
    
      requestPermissions((isGranted: boolean) => {
        if (isGranted) {
          if(!bool) {
            scanForDevices();
            bool = true;
          }
        }
      });
    
      console.log(allDevices);

      if(currentDevice) {
        console.log(currentDevice);
        getCameraSerialFromBLE(currentDevice);
      }

    return (
    <View>
        <ScrollView>
            {allDevices.map((item) => (
                <View key={item.id}>
                    <Button 
                    title={item.id}
                    onPress={() => {
                      connectToDevice(item);
                      }}/>
                </View>
            ))}
        </ScrollView>
    </View>
    )
}