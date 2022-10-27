import { TokenResponse } from 'expo-auth-session';
import * as React from 'react';
import { View } from 'react-native';
import KeyCloakButton from '../components/KeyCloakButton';

interface Props {
  // Called when the authentication flow completes and we've received a token set
  onTokenResponse(response: TokenResponse): void;
}

/**
 * Screen will automatically open to log in to KeyCloak.
 * Will also include a "Log into KeyCloak" button so that if the
 * web browser doesn't open, the web browser can still be there.
 *
 * @returns LoginScreen component
 */
export default function LoginScreen({ onTokenResponse }: Props): React.ReactElement {
  return (
    <View>
      <KeyCloakButton onTokenResponse={onTokenResponse} />
    </View>
  );
}
