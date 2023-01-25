import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
// delete one of the two below depending on which icon is used
// AND ADD TO CAMERA SIDE TO TEST IF THE showAlert() function works
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';
import { BackendContext } from '../contexts/backendContext';
import { UserContext } from '../contexts/userContext';

const showAlert = (groupId: string) => {
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

  const groupObj = userContext.getGroupFromId(groupId);

  if (groupObj === null) {
    console.error(`Group object was not found with the given group ID '${groupId}'`);
    throw new Error(`Group object was not found with the given group ID '${groupId}'`);
  }

  if (groupObj?.cameras.length == 0) {
    Alert.alert(
      "Delete Group",
      "Would you like to delete this Group?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {async () => {
            const response: boolean | null = await backendContext.deleteGroupAPI(groupId);
            if (response) {
              /*
              for (let i = 0; i < userContext.groupList.length; i++) {
                if (userContext.groupList[i].groupId === groupId) {
                  userContext.removeGroupFromList(i);
                  break;
                }
                if (i == userContext.groupList.length-1) {
                  throw new Error(`Group ID was not found in the user's group list.`);
                }
              }
              */

              const group = userContext.getGroupFromId(groupId);
              if (group) {
                const groupIndex = userContext.groupList.indexOf(group);
                if (groupIndex != -1) {
                  userContext.removeGroupFromList(groupIndex);
                } else {
                  console.error(`Trying to find the index of the group to be removed was not successful`);
                  throw new Error(`Trying to find the index of the group to be removed was not successful`);
                }
              }
            } else {
              console.error('Error when removing the groupId');
              Alert.alert('Error when removing the group!');
            }
          }}
        }
      ]
    );
  } else {
    Alert.alert(
      "Delete Group",
      `There are still cameras attached to this group. Please remove the cameras in '${groupObj?.groupName}' before deleting this group!`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
      ]
    );
  }
};

export default function DeleteButton(props: { groupId: string  }): React.ReactElement {
  const { groupId } = props;
  return (
    <TouchableOpacity 
      style={styles.menuItemSettingsButton}
      onPress={() => {
        showAlert(groupId);
      }}
    >
      <FontAwesome5 name="trash" size={24} color="black" />
    </TouchableOpacity>
  )
}