import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import KeyCloakButton from '../components/KeyCloakButton';

/**
 * Screen will automatically open to log in to KeyCloak.
 * Will also include a "Log into KeyCloak" button so that if the
 * web browser doesn't open, the web browser can still be there.
 *
 * @returns LoginScreen component
 */
export default function LoginScreen({ setTokenResponse }): React.ReactElement {
  return (
    <View>
      <KeyCloakButton setTokenResponse={setTokenResponse} />
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
