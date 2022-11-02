import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import BluetoothScreen from '../../screens/CameraRegistration/BluetoothScreen';
import LoadingScreen from '../../screens/CameraRegistration/LoadingScreen';
import EnterCameraRegInfoScreen from '../../screens/CameraRegistration/EnterCameraRegInfoScreen';
import { BLEParamList } from '../Navigation/bleParamList';

const Stack = createNativeStackNavigator<BLEParamList>();

export default function BLEScreens() {
    return (
        <Stack.Navigator
            initialRouteName='BluetoothDeviceList'
            defaultScreenOptions={{
                headerStyle: {
                    backgroundColor: '#1E90FF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitleVisible: true,
                headerBackVisible: true,
            }}
        >
            <Stack.Screen
                name='BluetoothDeviceList'
                component={BluetoothScreen}
                options={{ title: 'Select camera to add' }}
            />
            <Stack.Screen
                name='CameraRegistrationInfo'
                component={EnterCameraRegInfoScreen}
                options={{ title: 'Enter WiFi Details' }}
            />
            <Stack.Screen
                name='Loading'
                component={LoadingScreen}
                options={{ title: 'Connecting Camera to WiFi...', }}
            />
        </Stack.Navigator>
    );
}