import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const styles = StyleSheet.create({
  centerIcon: {
    alignSelf: 'center',
  },
});

export default function LoadingIcon(): React.ReactElement {
  return (
    <View style={styles.centerIcon}>
      <AntDesign name="loading2" size={24} color="black" />
    </View>
  );
}
