import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
// delete one of the two below depending on which icon is used
// AND ADD TO CAMERA SIDE TO TEST IF THE showAlert() function works
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';
import { BackendContext } from '../contexts/backendContext';
import { UserContext } from '../contexts/userContext';

const showAlert = (objectId: string, objectType: string) => {
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

  if (objectType === "Group") {
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
            const response: boolean | null = await backendContext.deleteGroupAPI(objectId);
            if (response) {
              for (let i = 0; i < userContext.groupList.length; i++) {
                if (userContext.groupList[i].groupId === objectId) {
                  userContext.removeGroupFromList(i);
                  break;
                }
                if (i == userContext.groupList.length-1) {
                  throw new Error(`Group ID was not found in the user's group list.`);
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
  }
  // CREATE A TEST CASE FOR WHEN THE objectType is Group and objectId still has a camera in it.

  if (objectType === "Camera") {
    Alert.alert(
      "Delete Camera",
      "Would you like to delete this Camera?\nWARNING: This will delete all notifications tied to this Camera.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Acknowledge",
          onPress: () => console.log("OK pressed")
        }
      ]
    );
  }
};

export default function DeleteButton(props: { objectId: string, objectType: string }): React.ReactElement {
  const { objectId, objectType } = props;
  return (
    <TouchableOpacity 
      style={styles.menuItemSettingsButton}
      onPress={() => {
        // change to show an alert depending on the objectType. Create function to handle this
        showAlert(objectId, objectType);
      }}
    >
      <FontAwesome5 name="trash" size={24} color="black" />
    </TouchableOpacity>
  )
}