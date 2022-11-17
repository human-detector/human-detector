import * as React from 'react';
import { TextInput, View, Button } from 'react-native';
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
           * Upon button press, register a group
           */
          const groupId: string | null = await backendContext.registerGroupAPI(groupName);
          if (!groupId) {
            console.error('Error in getting the groupId!');
            throw new Error('Error in group registration');
          }
          const newGroup = new Group(groupName, groupId, []);
          userContext.groupList.push(newGroup);
          navigation.goBack();
        }}
      />
    </View>
  );
}
