import * as React from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { BleManager } from 'react-native-ble-plx';
import { FontAwesome } from '@expo/vector-icons';
import { NotificationBehavior } from 'expo-notifications';
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
import { zPushNotificationData } from './classes/PushNotificationData';
// Android uses a stripped down JS engine for React Native apps that doesn't support
// this API, so we need a polyfill: https://stackoverflow.com/a/70261935
import 'intl';
import 'intl/locale-data/jsonp/en';

const navigatorRef = createNavigationContainerRef<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const bleService = new BLEService(new BleManager());

export default function App(): React.ReactElement {
  const [backendService, setBackendService] = React.useState<BackendService | null>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);

  // HACK: this ref is only necessary so the Notification handler has an up-to-date reference to 'groups'
  const groupsRef = React.useRef<Group[]>(groups);
  React.useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  React.useEffect(() => {
    Notifications.addNotificationResponseReceivedListener((event) => {
      const notificationParse = zPushNotificationData.safeParse(
        event.notification.request.content.data
      );
      if (!notificationParse.success) {
        console.error('Failed to parse snapshot push notification', notificationParse.error);
        return;
      }

      if (
        event.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER &&
        navigatorRef.isReady()
      ) {
        navigatorRef.navigate('Snapshot', {
          snapshotId: notificationParse.data.snapshotId,
        });
      }
    });
  }, []);

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
                  Notifications.setNotificationHandler({
                    handleNotification: async (pushNotification) => {
                      const ignoreNotificationBehavior: NotificationBehavior = {
                        shouldShowAlert: false,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                      };

                      const pushNotificationDataParseResult = zPushNotificationData.safeParse(
                        pushNotification.request.content.data
                      );
                      if (!pushNotificationDataParseResult.success) {
                        console.error(
                          'Failed to parse push notification data',
                          pushNotificationDataParseResult.error
                        );
                        return ignoreNotificationBehavior;
                      }
                      const pushNotificationData = pushNotificationDataParseResult.data;

                      const group = groupsRef.current.find(
                        (grp) => grp.groupId === pushNotificationData.groupId
                      );
                      const camera = group?.cameras.find(
                        (cam) => cam.cameraId === pushNotificationData.cameraId
                      );
                      if (camera === undefined) {
                        const notificationId = pushNotificationData;
                        console.log(
                          `Received notification with ID "${notificationId}", which isn't associated with any known cameras.`
                        );
                        return ignoreNotificationBehavior;
                      }

                      // Don't notify again for a notification that has already been received
                      if (
                        camera.notifications.find(
                          (notification) => notification.id === pushNotificationData.id
                        )
                      ) {
                        console.log('Ignoring notification', { pushNotificationData });
                        return ignoreNotificationBehavior;
                      }

                      // FIXME: this doesn't cause a re-render if the notification is received while on the notifications screen
                      camera.notifications.push(pushNotificationData);
                      return {
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: false,
                      };
                    },
                  });
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

  // Put all the cameras in a map
  user.makeCameraMapFromGroups();

  return (
    <NavigationContainer ref={navigatorRef}>
      <UserContext.Provider value={user}>
        <BLEContext.Provider value={bleService}>
          <BackendContext.Provider value={backendService}>
            <Stack.Navigator
              screenOptions={({ navigation }) => ({
                headerStyle: {
                  backgroundColor: '#1E90FF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                // eslint-disable-next-line react/no-unstable-nested-components
                headerRight: () => (
                  <FontAwesome
                    name="bell"
                    size={28}
                    color="white"
                    onPress={() => {
                      navigation.navigate('Notifications', {
                        cams: [...user.cameraMap.keys()],
                      });
                    }}
                  />
                ),
              })}
            >
              <Stack.Screen name="Groups" component={GroupScreen} options={{ title: 'Groups' }} />
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
