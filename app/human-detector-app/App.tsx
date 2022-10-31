import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Device } from 'react-native-ble-plx';
import CameraScreen from './screens/CameraScreen';
import GroupScreen from './screens/GroupScreen';
import LoginScreen from './screens/LoginScreen';
import BluetoothScreen from './screens/CameraRegistration/BluetoothScreen';
import LoadingScreen from './screens/CameraRegistration/LoadingScreen';
import EnterCameraRegInfoScreen from './screens/CameraRegistration/EnterCameraRegInfoScreen';
import fetchPushToken from './src/notifications/fetchPushToken';
import BackendService from './services/backendService';
import { BackendContext } from './contexts/backendContext';

const Stack = createNativeStackNavigator();

export default function App(): React.ReactElement {
  const [backendService, setBackendService] = React.useState<BackendService | null>(null);
  const [currentDevice, setConnectedDevice] = React.useState<Device | null>(null);

  const bleContext = {
    device: currentDevice,
    setDevice: setConnectedDevice,
    connect: async (device: Device) => {
     try {
       const deviceConnection = await device.connect();
       setConnectedDevice(deviceConnection);
     } catch (error) {
       console.log('ERROR WHEN CONNECTING', error);
     }
   }
  }

  // If the user isn't logged in
  if (backendService === null) {
    // Open the login screen
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            options={{
              title: 'EyeSpy',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            {() => (
              <LoginScreen
                onSuccessfulLogin={(tokenManager) => {
                  const backend = new BackendService(tokenManager);
                  setBackendService(backend);
                  fetchPushToken()
                    .then((token) => backend.sendNotifyTokenAPI(token))
                    .catch((error) =>
                      console.error('Error fetching or updating push token', error)
                    );
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // If the user is logged in return the stack with all the information
  return (
    <NavigationContainer>
      <BackendContext.Provider value={backendService}>
        <Stack.Navigator>
          <Stack.Screen
            name="Groups"
            component={GroupScreen}
            options={{
              title: 'EyeSpy',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="Cameras"
            component={CameraScreen}
            options={{
              title: 'EyeSpy',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerBackTitleVisible: false,
              headerBackVisible: true,
            }}
          />
          <Stack.Screen
            name="Bluetooth"
            component={BluetoothScreen}
            options={{
              title: 'Connect Camera',
              headerStyle: {
                backgroundColor: '#1E90FF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="CameraRegistrationInfo"
            component={EnterCameraRegInfoScreen}
            options={{
              title: 'Connect Camera',
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
          />
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{
              title: 'Connect Camera',
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
          />
        </Stack.Navigator>
      </BackendContext.Provider>
    </NavigationContainer>
  );
}
