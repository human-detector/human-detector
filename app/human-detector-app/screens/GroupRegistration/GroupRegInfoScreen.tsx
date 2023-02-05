import * as React from 'react';
import { TextInput, View, Button, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GroupRegParamList } from '../../src/navigation/groupRegParamList';
import { BackendContext } from '../../contexts/backendContext';
import Group from '../../classes/Group';
import { UserContext } from '../../contexts/userContext';
import { styles } from '../../src/styles';

type Props = NativeStackScreenProps<GroupRegParamList, 'GroupRegistrationInfo'>;
export default function GroupRegInfoScreen({ navigation }: Props): React.ReactElement {
  const [groupName, setGroupName] = React.useState('');
  const backendContext = React.useContext(BackendContext);
  const userContext = React.useContext(UserContext);

  if (!backendContext) {
    console.error('no backend context!');
    throw new Error('no backend context');
  }
  if (!userContext) {
    console.error('no user context!');
    throw new Error('no user context');
  }
  return (
    <View style={styles.regContainer}>
      <TextInput
        style={styles.input}
        onChangeText={setGroupName}
        value={groupName}
        placeholder="Enter Group Name"
      />
      <Button
        title="Add Group"
        onPress={async () => {
          /**
           * Upon button press, register a group after verifying the groupName isn't the same
           */
          userContext.groupList.forEach(group => {
            if (group.groupName === groupName) {
              Alert.alert('Error: You cannot use the same name for a group more than once.');
              console.error(`groupName was used more than once called: ${groupName}`);
              navigation.goBack();
            }    
          })

          const groupId: string | null = await backendContext.registerGroupAPI(groupName);
          if (groupId) {
            const newGroup = new Group(groupName, groupId, []);
            userContext.groupList.push(newGroup);
          } else {
            console.error('Error in getting the groupId!');
            Alert.alert('Error when adding a group!');
            navigation.goBack();
          }
          navigation.goBack();
        }}
      />
    </View>
  );
}
