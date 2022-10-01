import * as React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';

export default function LoginScreen(): React.ReactElement {
  const discovery = AuthSession.useAutoDiscovery('http://localhost:8080/realms/myrealm');
  console.log(discovery);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'myclient',
      scopes: ['openid'],
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: 'http://localhost:19006',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
    }
  }, [response]);
  // registerNNPushToken(4044, 'bbBo3vbjuqXCetI9mvFYic');
  // console.log(DeviceInfo.getModel()); // it returns 'Simulator'

  return (
    <View>
      <Button 
      onPress={promptAsync}
      title="Login with KeyCloak"
      >
        <Text>Test</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: 40,
    // paddingHorizontal: 20
  },
});
