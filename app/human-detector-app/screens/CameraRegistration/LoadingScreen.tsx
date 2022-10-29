import * as React from 'react';
import { View } from 'react-native';
import LoadingIcon from '../../components/LoadingIcon';

/**
 * The LoadingScreen screen will display when a user is waiting for something.
 * The original primary use for this screen is for when the user is waiting for
 * a successful connection notifciation from the camera.
 */
export default function LoadingScreen(): React.ReactElement {
  return (
    <View>
      <LoadingIcon />
    </View>
  );
}
