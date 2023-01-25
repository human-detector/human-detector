import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';
import { BackendContext } from '../contexts/backendContext';
import { UserContext } from '../contexts/userContext';
import BackendService from '../services/backendService';
import User from '../classes/User';

const showAlert = async (groupId: string, backendContext: BackendService, userContext: User) => {
  const groupObj = userContext.getGroupFromId(groupId);

  if (groupObj === null) {
    console.error(`Group object was not found with the given group ID '${groupId}'`);
    Alert.alert('Error when removing the group!');
  }

  if (groupObj?.cameras.length == 0) { // when there are no cameras, should popup delete alert
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
            if (response) { // if the backend deletion was successful, moves onto deleting it for the user.
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
                if (groupIndex != -1) { // removes the group if it finds the index
                  userContext.removeGroupFromList(groupIndex);
                } else { // did not find the index.
                  console.error(`Trying to find the index of the group to be removed was not successful`);
                  Alert.alert('Error when removing the group!');
                }
              }
            } else {
              console.error('Could not find the group object from the groupId during deletion.');
              Alert.alert('Error when removing the group!');
            }
          }}
        }
      ]
    );
  } else { // 1 or more camera is in group and should alert the user.
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

export default function DeleteGroupButton(props: { groupId: string  }): React.ReactElement {
    // the delete button isnt working. and look at app lint tests to fix them.

    const backendContext = React.useContext(BackendContext);
    const userContext = React.useContext(UserContext);
  
    if (!backendContext) {
      Alert.alert('Error when removing the group!');
      throw new Error('no backend context');
    }
    if (!userContext) {
      Alert.alert('Error when removing the group!');
      throw new Error('no user context');
    }

  const { groupId } = props;
  return (
    <TouchableOpacity 
      style={styles.menuItemSettingsButton}
      onPress={ async () => {
        await showAlert(groupId, backendContext, userContext);
      }}
    >
      <FontAwesome5 name="trash" size={24} color="black" />
    </TouchableOpacity>
  )
}