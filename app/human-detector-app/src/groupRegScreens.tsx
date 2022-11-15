import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingScreen from '../screens/CameraRegistration/LoadingScreen';
import GroupRegInfoScreen from '../screens/GroupRegistration/GroupRegInfoScreen';
import { GroupRegParamList } from './navigation/groupRegParamList';

const Stack = createNativeStackNavigator<GroupRegParamList>();

export default function GroupRegistrationScreen() {
  return (
    <Stack.Navigator
      initialRouteName="GroupRegistrationInfo"
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
        name="GroupRegistrationInfo"
        component={GroupRegInfoScreen}
        options={{ title: 'Enter Group Information' }}
      />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ title: 'Connecting Camera to Wifi...' }}
      />
    </Stack.Navigator>
  );
}
