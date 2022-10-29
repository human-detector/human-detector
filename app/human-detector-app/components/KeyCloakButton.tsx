import * as React from 'react';
import { View, Button } from 'react-native';
import Constants from 'expo-constants';
import { TokenResponse, makeRedirectUri, useAutoDiscovery } from 'expo-auth-session';
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
  for (let i = 0; i < size; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

const redirectUri = makeRedirectUri();

interface Props {
  onTokenResponse(response: TokenResponse): void;
}

/**
 * This component will generate a button that will redirect to
 * KeyCloak authorization.
 *
 * @returns KeyCloakButton component
 */
export default function KeyCloakButton({ onTokenResponse }: Props): React.ReactElement {
  const [codeVerifier, setCodeVerifier] = React.useState(genCodeVerifier(100));
  const apiUrl: string = Constants.manifest?.extra?.keycloakUrl;

  const discovery = useAutoDiscovery(`${apiUrl}/realms/users`);
  const [, response, promptAsync] = KeyCloakAuth.getAuthRequest(
    discovery,
    redirectUri,
    codeVerifier
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      // Returns authorization code will be connected to a user object
      KeyCloakAuth.exchangeCodeForToken(code, discovery, codeVerifier, redirectUri)
        .then((val) => onTokenResponse(val as TokenResponse))
        .catch((error) => {
          console.log(error);
        });
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
