import * as React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CameraSettingsButton from '../components/CameraSettingsButton';
import { UserContext } from '../contexts/userContext';
import { RootStackParamList } from '../src/navigation/stackParamList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: 40,
    // paddingHorizontal: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  pads: {
    padding: 10,
  },
  boldHeader: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  menuItem: {
    marginTop: 24,
    marginLeft: 20,
    marginRight: 20,
    padding: 30,
    backgroundColor: '#E0FFFF',
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#D3D3D3',
  },
  addButtonItem: {
    borderColor: '#D3D3D3',
    backgroundColor: '#DCDCDC',
  },
  menuButtonText: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    alignItems: 'center',
    fontSize: 50,
    marginTop: 0,
    marginBottom: 0,
  },
});

type Props = NativeStackScreenProps<RootStackParamList, 'Cameras'>;
export default function CameraScreen({ navigation, route }: Props): React.ReactElement {
  const userContext = React.useContext(UserContext);
  const isFocused = useIsFocused();
  const { groupId } = route.params;

  if (!userContext) {
    console.error('no user context in camera screen!');
    throw new Error('no user context in camera screen');
  }
  const groupToView = userContext.getGroupFromId(groupId);

  return (
    <View style={styles.container}>
      <ScrollView>
        {groupToView?.getCameras.map((item) => (
          <View key={item.getCameraId}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('You clicked on a camera!');
              }}
            >
              <Text style={styles.menuButtonText}> {item.getCameraName} </Text>
              <CameraSettingsButton cameraId={item.getCameraId} />
            </TouchableOpacity>
          </View>
        ))}

        <View key="add-button">
          <TouchableOpacity
            style={[styles.menuItem, styles.addButtonItem]}
            onPress={() => {
              // Start camera registration process
              navigation.navigate('CameraRegistration', { screen: 'BluetoothDeviceList' });
            }}
          >
            <Text style={styles.addButtonText}> + </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export function CameraOnPress() {}

export function CameraDisplayButton() {}

export function getCameraThumbnail() {}

export function getCameraStream() {}

export function isCameraOnline(): boolean {
  return true;
}
