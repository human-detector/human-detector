import * as React from 'react';
import { View, Text, ScrollView, Button, Alert } from 'react-native';
import useBLE from '../src/ble/bletest';

export default function BluetoothScreen(): React.ReactElement {
    
    // Make list of all bluetooth devices

    const {
        requestPermissions,
        connectToDevice,
        scanForDevices,
        currentDevice,
        heartRate,
        allDevices,
      } = useBLE();
    
      requestPermissions((isGranted: boolean) => {
        if (isGranted) {
          scanForDevices();
        }
      });
    
      console.log(allDevices);

    return (
    <View>
        <ScrollView>
            {allDevices.map((item) => (
                <View key={item.id}>
                    <Button 
                    title={item.id}
                    onPress={() => Alert.alert('Connection Successful')}/>
                </View>
            ))}
        </ScrollView>
    </View>
    )
}