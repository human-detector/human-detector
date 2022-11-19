import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CameraSettingsButton from '../components/CameraSettingsButton';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { UserContext } from '../contexts/userContext';
import { styles } from '../src/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>;
export default function GroupScreen({ navigation }: Props): React.ReactElement {
  const userContext = React.useContext(UserContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFocused = useIsFocused();

  if (!userContext) {
    console.error('User context not defined!');
    throw new Error('Error in GroupScreen.');
  }

  const pressHandler = (groupId: string) => {
    // TODO: Navigate with the camera array for the group press
    navigation.navigate('Cameras', { groupId });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {userContext.groupList.map((item) => (
          <View key={item.groupId}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                pressHandler(item.groupId);
              }}
            >
              <Text style={styles.menuButtonText}> {item.groupName} </Text>
              <CameraSettingsButton cameraId={item.groupId} />
            </TouchableOpacity>
          </View>
        ))}

        <View key="add-button">
          <TouchableOpacity
            style={[styles.menuItem, styles.addButtonItem]}
            onPress={() => {
              // Start group registration
              navigation.navigate('GroupRegistration', {
                screen: 'GroupRegistrationInfo',
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
