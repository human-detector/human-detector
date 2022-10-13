import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TokenResponse } from 'expo-auth-session';
import JWT from 'expo-jwt';
import * as CryptoJS from 'crypto-js';
import User from './classes/User';
import CameraScreen from './screens/CameraScreen';
import GroupScreen from './screens/GroupScreen';
import LoginScreen from './screens/LoginScreen';
import { getExponentPushToken, sendExpoNotifToken } from './src/notifications/notifTokenInit';

const Stack = createNativeStackNavigator();

export default function App(): React.ReactElement {
  let isUserSignedIn = false;

  // Update upon getting a token
  const [tokenResponse, setTokenResponse] = React.useState(null);

  // Check if the token is expired
  if (tokenResponse != null) {
    // TODO: refresh token if expired

    // if not expired, then user is signed in
    isUserSignedIn = true;
  }

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
            {(props) => <LoginScreen setTokenResponse={setTokenResponse} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // If logged in, make the user and put them into the app
  console.log(tokenResponse);

  // Decode Base64
  const words = CryptoJS.enc.Base64.parse(tokenResponse.idToken.split('.')[1]); // Get the payload
  const textString = CryptoJS.enc.Utf8.stringify(words);

  const user = new User(
    JSON.parse(textString).preferred_username,
    JSON.parse(textString).sub,
    isUserSignedIn
  );

  sendExpoNotifToken(user.userID).catch(() => console.error('Error in sending expo token!'));

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: 40,
    // paddingHorizontal: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  pads: {
    padding: 10,
  },
  boldHeader: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  menuItem: {
    marginTop: 24,
    marginLeft: 20,
    marginRight: 20,
    padding: 30,
    backgroundColor: '#E0FFFF',
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#D3D3D3',
  },
  addButtonItem: {
    borderColor: '#D3D3D3',
    backgroundColor: '#DCDCDC',
  },
  menuButtonText: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    alignItems: 'center',
    fontSize: 50,
    marginTop: 0,
    marginBottom: 0,
  },
});
