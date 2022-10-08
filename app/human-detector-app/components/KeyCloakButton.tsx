import * as React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';
import { useAutoDiscovery } from 'expo-auth-session';
import KeyCloakInstance from '../auth/KeyCloakAuth';

const keyCloakAuth: KeyCloakInstance = new KeyCloakInstance();

/**
 * This component will generate a button that will redirect to
 * KeyCloak authorization.
 *
 * @returns KeyCloakButton component
 */
export default function KeyCloakButton(): React.ReactElement {
  const apiUrl: string = Constants.manifest?.extra?.keycloakUrl;

  const discovery = useAutoDiscovery(`${apiUrl}/realms/myrealm`);
  const [request, response, promptAsync] = keyCloakAuth.getAuthRequest(discovery);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      // Returns authorization code will be connected to a user object
      keyCloakAuth.exchangeCodeForToken(code, discovery);
    }
  }, [response]);

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
