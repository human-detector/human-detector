import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const styles = StyleSheet.create({
  menuItemSettingsButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
});

export default function CameraSettingsButton(props: { cameraId: string }): React.ReactElement {
  const { cameraId } = props;
  return (
    <TouchableOpacity
      style={styles.menuItemSettingsButton}
      onPress={() => {
        // This will do something in the future for now. This is just a placeholder print statement
        console.log(cameraId);
      }}
    >
      <AntDesign name="setting" size={24} color="black" />
    </TouchableOpacity>
  );
}
