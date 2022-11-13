import * as React from 'react';
import { TextInput, View, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GroupRegParamList } from '../../src/navigation/groupRegParamList';
import { BackendContext } from '../../contexts/backendContext';
import Group from '../../classes/Group';
import { UserContext } from '../../contexts/userContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  input: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    marginTop: 20,
  },
});

type Props = NativeStackScreenProps<GroupRegParamList, 'GroupRegistrationInfo'>;
export default function GroupRegInfoScreen({ route, navigation }: Props): React.ReactElement {
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

  console.log(route);
  return (
    <View>
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
          // const groupId: string | null = await backendContext.registerGroupAPI(groupName);
          // if (!groupId) {
          //   console.error('Error in getting the groupId!');
          //   throw new Error('Error in group registration');
          // }
          const newGroup = new Group(groupName, '84923843294823984', []);
          userContext.addGroupToList(newGroup);
          console.log(userContext.getGroupList);
          navigation.goBack();
        }}
      />
    </View>
  );
}
