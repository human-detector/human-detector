import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { BleManager } from 'react-native-ble-plx';
import { FontAwesome } from '@expo/vector-icons';
import CameraScreen from './screens/CameraScreen';
import GroupScreen from './screens/GroupScreen';
import LoginScreen from './screens/LoginScreen';
import fetchPushToken from './src/notifications/fetchPushToken';
import BackendService from './services/backendService';
import { BackendContext } from './contexts/backendContext';
import { BLEContext } from './contexts/bleContext';
import { BLEService } from './src/ble/bleServices';
import BLEScreens from './src/ble/bleScreens';
import { UserContext } from './contexts/userContext';
import GroupRegistrationScreen from './src/groupRegScreens';
import { RootStackParamList } from './src/navigation/stackParamList';
import User from './classes/User';
import Group from './classes/Group';
import NotifScreen from './screens/NotifScreen';
import SnapshotScreen from './screens/SnapshotScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const bleService = new BLEService(new BleManager());

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App(): React.ReactElement {
  const [backendService, setBackendService] = React.useState<BackendService | null>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);
 

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
              headerShown: false,
            }}
          >
            {() => (
              <LoginScreen
                onSuccessfulLogin={async (tokenManager) => {
                  const backend = new BackendService(tokenManager);
                  setBackendService(backend);
                  fetchPushToken()
                    .then((token) => backend.sendNotifyTokenAPI(token))
                    .catch((error) =>
                      console.error('Error fetching or updating push token', error)
                    );
                  setGroups((await backend.getGroupListAPI()) ?? []);
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // If the user is logged in return the stack with all the information
  const user: User = backendService.getUser();
  user.groupList = groups;

  return (
    <NavigationContainer>
      <UserContext.Provider value={user}>
        <BLEContext.Provider value={bleService}>
          <BackendContext.Provider value={backendService}>
            <Stack.Navigator
              screenOptions={({navigation}) => ({
                headerStyle: {
                  backgroundColor: '#1E90FF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => <FontAwesome name = "bell" size={28} color="white" onPress={() => {
                  navigation.navigate('Notifications', { notifications: user.getAllNotifications()});
                }}/>
              })}
            >
              <Stack.Screen 
                name="Groups" 
                component={GroupScreen} 
                options={{ title: 'Groups' }} />
              <Stack.Screen
                name="Cameras"
                component={CameraScreen}
                options={{
                  title: 'Cameras',
                  headerBackTitleVisible: false,
                  headerBackVisible: true,
                }}
              />
              <Stack.Screen
                name="CameraRegistration"
                component={BLEScreens}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="GroupRegistration"
                component={GroupRegistrationScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotifScreen} 
                options={{
                  headerRight: () => null,
                }}
              />
              <Stack.Screen 
                name="Snapshot" 
                component={SnapshotScreen}
                options={{
                  headerRight: () => null,
                }} 
              />
            </Stack.Navigator>
          </BackendContext.Provider>
        </BLEContext.Provider>
      </UserContext.Provider>
    </NavigationContainer>
  );
}
