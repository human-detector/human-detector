import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';
import { BackendContext } from '../contexts/backendContext';
import { UserContext } from '../contexts/userContext';

const showAlert = (groupId: string, cameraId: string) => {
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
        text: "Delete",
        onPress: () => {async () => {
          const response: boolean | null = await backendContext.deleteCameraAPI(groupId, cameraId);
          if (response) {
            const groupObj = userContext.getGroupFromId(groupId);
            if (groupObj) {
              const cameraObj = groupObj.getCameraFromId(cameraId);
              if (cameraObj) {
                cameraObj.notifications = [];
                const camIndex = groupObj.cameras.indexOf(cameraObj);
                groupObj.removeCameraFromGroup(camIndex); // can I do it like this or do i have to start with the userContext even though groupObj is from userContext
              }
            }
          }
        }}
      }
    ]
  );
};

export default function DeleteButton(props: { groupId: string, cameraId: string }): React.ReactElement {
  const { groupId, cameraId } = props;
  return (
    <TouchableOpacity 
      style={styles.menuItemSettingsButton}
      onPress={() => {
        showAlert(groupId, cameraId);
      }}
    >
      <FontAwesome5 name="trash" size={24} color="black" />
    </TouchableOpacity>
  )
}