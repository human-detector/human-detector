import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';
import { BackendContext } from '../contexts/backendContext';
import { UserContext } from '../contexts/userContext';
import BackendService from '../services/backendService';
import User from '../classes/User';
import Group from '../classes/Group';

const showAlert = async (groupId: string, backendContext: BackendService, userContext: User, setGroups: (groupList:Group[]) => void) => {
  const groupObj = userContext.getGroupFromId(groupId);
  if (groupObj === null) {
    console.error(`Group object was not found with the given group ID '${groupId}'`);
    Alert.alert('Error when removing the group!');
  }

  if (groupObj?.cameras.length === 0) { // when there are no cameras, should popup delete alert
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
          onPress: async () => {  {
            const response: number | null = await backendContext.deleteGroupAPI(groupId);
            if (response === 200) { // if the backend deletion was successful, moves onto deleting it for the user.
              const group = userContext.getGroupFromId(groupId);
              if (group) {
                const groupIndex = userContext.groupList.indexOf(group);
                if (groupIndex !== -1) { // removes the group if it finds the index
                  userContext.removeGroupFromList(groupIndex);
                  setGroups(userContext.groupList);
                } else { // did not find the index.
                  console.error(`Trying to find the index of the group to be removed was not successful`);
                  Alert.alert('Error when removing the group!');
                }
              }
            } else {
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

export default function DeleteGroupButton(props: { groupId: string, setGroups: (groupList:Group[]) => void }): React.ReactElement {
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
  const { groupId, setGroups } = props;
  return (
    <TouchableOpacity 
      style={styles.menuItemSettingsButton}
      onPress={() => {
        showAlert(groupId, backendContext, userContext, setGroups);
      }}
    >
      <FontAwesome5 name="trash" size={24} color="black" />
    </TouchableOpacity>
  )
}