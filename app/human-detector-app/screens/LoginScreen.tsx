import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as React from 'react';
import { Button, View } from 'react-native';
import TokenFetcher from '../src/auth/tokenFetcher';
import TokenManager from '../src/auth/tokenManager';

interface Props {
  onSuccessfulLogin(tokenManager: TokenManager): void;
}

/**
 * Screen will automatically open to log in to KeyCloak.
 * Will also include a "Log into KeyCloak" button so that if the
 * web browser doesn't open, the web browser can still be there.
 *
 * @returns LoginScreen component
 */
export default function LoginScreen({ onSuccessfulLogin }: Props): React.ReactElement<Props> {
  return (
    <View>
      <Button
        title="Login"
        onPress={() => {
          const clientId = Constants.manifest?.extra?.clientId;
          const issuerOrigin = Constants.manifest?.extra?.keycloakUrl;
          const issuer = new URL('/realms/users', issuerOrigin);
          const redirectUri = makeRedirectUri();
          new TokenFetcher(clientId, issuer, redirectUri)
            .getTokenManager()
            .then(onSuccessfulLogin)
            .catch((error) => console.error('Login flow failed', error));
        }}
      />
    </View>
  );
}
