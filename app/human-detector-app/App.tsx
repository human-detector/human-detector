import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as AuthSession from 'expo-auth-session';
import CameraScreen from './screens/CameraScreen';
import GroupScreen from './screens/GroupScreen';
import LoginScreen from './screens/LoginScreen';
import { sendExpoNotifToken } from './src/notifications/notifTokenInit';
import { getUserFromIDToken } from './src/auth/keyCloakAuth';
import User from './classes/User';

const Stack = createNativeStackNavigator();

export default function App(): React.ReactElement {
  let isUserSignedIn = false;
  // Hooks

  // Update upon getting a token
  const [tokenResponse, setTokenResponse] = React.useState<AuthSession.TokenResponse | null>(null);
  const [user, setUser] = React.useState<User | null>(null);

  // Check if the token is expired
  if (tokenResponse != null) {
    // TODO: check if token is expired
    // TODO: refresh token if expired
    // TODO: if token can't be refreshed, prompt user to login

    // if not expired, then user is signed in
    isUserSignedIn = true;
  }

  React.useEffect(() => {
    if (isUserSignedIn) {
      sendExpoNotifToken(user!.userID, tokenResponse!.accessToken).catch(() =>
        console.error('Error in sending expo token!')
      );
    }
  }, [isUserSignedIn]);

  // If the user isn't logged in
  if (!isUserSignedIn) {
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
                onTokenResponse={(response) => {
                  // Translates IDToken to a user
                  setUser(getUserFromIDToken(response.idToken!));
                  setTokenResponse(response);
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
