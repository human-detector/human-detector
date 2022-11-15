import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import BluetoothScreen from '../../screens/CameraRegistration/BluetoothScreen';
import LoadingScreen from '../../screens/CameraRegistration/LoadingScreen';
import EnterCameraRegInfoScreen from '../../screens/CameraRegistration/EnterCameraRegInfoScreen';
import { BLEParamList } from '../navigation/bleParamList';
import { RootStackParamList } from '../navigation/stackParamList';

const Stack = createNativeStackNavigator<BLEParamList>();
type Props = NativeStackScreenProps<RootStackParamList, 'CameraRegistration'>;
export default function BLEScreens({ route }: Props) {
  const { groupId } = route.params;

  return (
    <Stack.Navigator
      initialRouteName="BluetoothDeviceList"
      screenOptions={{
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
        name="BluetoothDeviceList"
        component={BluetoothScreen}
        options={{ title: 'Select camera to add' }}
      />
      <Stack.Screen
        name="CameraRegistrationInfo"
        component={EnterCameraRegInfoScreen}
        initialParams={{ groupId }}
        options={{ title: 'Enter WiFi Details' }}
      />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ title: 'Connecting Camera to WiFi...' }}
      />
    </Stack.Navigator>
  );
}
