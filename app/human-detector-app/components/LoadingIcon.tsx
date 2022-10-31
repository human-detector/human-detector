import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const styles = StyleSheet.create({
  centerIcon: {
    alignSelf: 'center',
  },
});

export enum LoadingState {
  Loading,
  Success,
  Failure
}

export interface LoadingIconProps {
  state: LoadingState,
}

export function LoadingIcon(props: LoadingIconProps): React.ReactElement<LoadingIconProps> {
  const { state } = props;
  switch(state) {
    case LoadingState.Loading:
      return (
        <View style={styles.centerIcon}>
          <AntDesign name="loading2" size={24} color="black" />
        </View>
      )
    case LoadingState.Success:
      return (
        <View style={styles.centerIcon}>
          <AntDesign name="checkcircleo" size={24} color="green" />
        </View>
      )
    case LoadingState.Failure:
      return (
        <View style={styles.centerIcon}>
          <AntDesign name="exclamationcircleo" size={24} color="red" />
        </View>
      )
    default:
      throw new Error("Invalid loading state!");
  }
}
