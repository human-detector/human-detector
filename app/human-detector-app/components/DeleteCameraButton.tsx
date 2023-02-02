import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';
import { BackendContext } from '../contexts/backendContext';
import { UserContext } from '../contexts/userContext';
import BackendService from '../services/backendService';
import User from '../classes/User';
import Camera from '../classes/Camera';

const showAlert = (groupId: string, cameraId: string, backendContext: BackendService, userContext: User, setCameras: (cameras:Camera[]) => void) => {
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
        onPress: async () => { {
          const response: number | null = await backendContext.deleteCameraAPI(groupId, cameraId);
          if (response === 200) { // if backend deletion was successful, moves onto deleting it for the user.
            const groupObj = userContext.getGroupFromId(groupId);
            if (groupObj) {
              const cameraObj = groupObj.getCameraFromId(cameraId);
              if (cameraObj) { // "removes" the notifications and the camera.
                cameraObj.notifications = [];
                const groupIndex = userContext.groupList.indexOf(groupObj);
                const camIndex = groupObj.cameras.indexOf(cameraObj);
                groupObj.removeCameraFromGroup(camIndex);
                setCameras(userContext.groupList[groupIndex].cameras);
              }
            }
          }
        }}
      }
    ]
  );
};

export default function DeleteCameraButton(props: { groupId: string, cameraId: string, setCameras: (cameras:Camera[]) => void }): React.ReactElement {
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
  const { groupId, cameraId, setCameras } = props;
  return (
    <TouchableOpacity 
      style={styles.menuItemSettingsButton}
      onPress={() => {
        showAlert(groupId, cameraId, backendContext, userContext, setCameras);
      }}
    >
      <FontAwesome5 name="trash" size={24} color="black" />
    </TouchableOpacity>
  )
}