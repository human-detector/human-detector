import * as React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';
import { makeRedirectUri, useAutoDiscovery } from 'expo-auth-session';
import * as KeyCloakAuth from '../src/auth/keyCloakAuth';

/**
 * Temporary codeVerifier generator
 * @param size size of the string
 * @returns generated random codeVerifier
 */
// TODO: Change this thing
function genCodeVerifier(size: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const charLength = chars.length;
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

const redirectUri = makeRedirectUri();

/**
 * This component will generate a button that will redirect to
 * KeyCloak authorization.
 *
 * @returns KeyCloakButton component
 */
export default function KeyCloakButton(): React.ReactElement {
  const [codeVerifier, setCodeVerifier] = React.useState(genCodeVerifier(100));
  const apiUrl: string = Constants.manifest?.extra?.keycloakUrl;

  const discovery = useAutoDiscovery(`${apiUrl}/realms/myrealm`);
  const [request, response, promptAsync] = KeyCloakAuth.getAuthRequest(
    discovery,
    redirectUri,
    codeVerifier
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      // Returns authorization code will be connected to a user object
      KeyCloakAuth.exchangeCodeForToken(code, discovery, codeVerifier, redirectUri);
    }
    setCodeVerifier(genCodeVerifier(100));
  }, [response]);

  return (
    <View>
      <Button
        onPress={() => {
          promptAsync();
        }}
        title="Login"
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
