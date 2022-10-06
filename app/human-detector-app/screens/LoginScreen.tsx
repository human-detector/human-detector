import * as React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { generateRandom } from 'expo-auth-session/build/PKCE';

export default function LoginScreen(): React.ReactElement {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const apiUrl: string = Constants.manifest?.extra?.keycloakUrl;

  const discovery = AuthSession.useAutoDiscovery(`${apiUrl}/realms/myrealm`);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'myclient',
      scopes: ['openid'],
      codeChallenge: generateRandom(30),
      redirectUri: makeRedirectUri({}),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log(code);
    }
  }, [response]);

  // registerNNPushToken(4044, 'bbBo3vbjuqXCetI9mvFYic');
  // console.log(DeviceInfo.getModel()); // it returns 'Simulator'

  return (
    <View>
      <Button
        onPress={() => {
          promptAsync();
        }}
        title="Login with KeyCloak"
      />
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
