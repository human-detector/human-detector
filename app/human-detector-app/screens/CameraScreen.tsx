import * as React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CameraSettingsButton from '../components/CameraSettingsButton';
import { UserContext } from '../contexts/userContext';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { styles } from '../src/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Cameras'>;
export default function CameraScreen({ navigation, route }: Props): React.ReactElement {
  const userContext = React.useContext(UserContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFocused = useIsFocused();
  const { groupId } = route.params;

  if (!userContext) {
    console.error('no user context in camera screen!');
    throw new Error('no user context in camera screen');
  }
  const groupToView = userContext.getGroupFromId(groupId);
  if (!groupToView) {
    throw new Error('Group to view not valid');
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {groupToView?.cameras.map((item) => (
          <View key={item.cameraId}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate('Notifications', {
                  cams: [item.cameraId],
                });
              }}
            >
              <Text style={styles.menuButtonText}> {item.cameraName} </Text>
              <CameraSettingsButton cameraId={item.cameraId} />
            </TouchableOpacity>
          </View>
        ))}

        <View key="add-button">
          <TouchableOpacity
            style={[styles.menuItem, styles.addButtonItem]}
            onPress={() => {
              // Start camera registration process
              navigation.navigate('CameraRegistration', {
                screen: 'BluetoothDeviceList',
                groupId,
              });
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
