import * as React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
// delete one of the two below depending on which icon is used
// AND ADD TO CAMERA SIDE TO TEST IF THE showAlert() function works
import {  FontAwesome5 } from '@expo/vector-icons'; 
import { styles } from '../src/styles';

const showAlert = (objectId: string, objectType: string) => {
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
          text: "Acknowledge",
          onPress: () => console.log("OK pressed")
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