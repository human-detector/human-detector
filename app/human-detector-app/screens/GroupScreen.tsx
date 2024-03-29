import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { UserContext } from '../contexts/userContext';
import { styles } from '../src/styles';
import DeleteGroupButton from '../components/DeleteGroupButton';
import Group from '../classes/Group';

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>;
export default function GroupScreen({ navigation }: Props): React.ReactElement {
  const userContext= React.useContext(UserContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isFocused = useIsFocused();

  if (!userContext) {
    console.error('User context not defined!');
    throw new Error('Error in GroupScreen.');
  }

  const [, setGroups] = React.useState<Group[]>(userContext.groupList);

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
              <DeleteGroupButton groupId={item.groupId} setGroups={setGroups} />
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
