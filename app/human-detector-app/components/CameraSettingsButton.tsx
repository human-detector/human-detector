import * as React from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Camera from '../classes/Camera';

export default function CameraSettingsButton(props: { cameraId: string }): React.ReactElement {
  return (
    <TouchableOpacity
      style={styles.menuItemSettingsButton}
      onPress={() => {
        // This will do something in the future for now. This is just a placeholder print statement
        console.log(props.cameraId);
      }}
    >
      <AntDesign name="setting" size={24} color="black" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItemSettingsButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
});
