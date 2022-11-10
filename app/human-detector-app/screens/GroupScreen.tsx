import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CameraSettingsButton from '../components/CameraSettingsButton';
import Group from '../classes/Group';
import { RootStackParamList } from '../src/navigation/stackParamList';
import { UserContext } from '../contexts/userContext';
import { NavigationHelpersContext, useFocusEffect, useIsFocused } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // paddingTop: 40,
    // paddingHorizontal: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  pads: {
    padding: 10,
  },
  boldHeader: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  menuItem: {
    marginTop: 24,
    marginLeft: 20,
    marginRight: 20,
    padding: 30,
    backgroundColor: '#E0FFFF',
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#D3D3D3',
  },
  addButtonItem: {
    borderColor: '#D3D3D3',
    backgroundColor: '#DCDCDC',
  },
  menuButtonText: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    alignItems: 'center',
    fontSize: 50,
    marginTop: 0,
    marginBottom: 0,
  },
});

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>;
export default function GroupScreen({ navigation }: Props): React.ReactElement {
  const userContext = React.useContext(UserContext);
  const isFocused = useIsFocused();

  if (!userContext) {
    console.error('User context not defined!');
    throw new Error('Error in GroupScreen.');
  }

  const pressHandler = (groupId: string) => {
    // TODO: Navigate with the camera array for the group press
    navigation.navigate('Cameras', { groupId });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {userContext.getGroupList.map((item) => (
          <View key={item.getGroupId}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                pressHandler(item.getGroupId);
              }}
            >
              <Text style={styles.menuButtonText}> {item.getGroupName} </Text>
              <CameraSettingsButton cameraId={item.getGroupId} />
            </TouchableOpacity>
          </View>
        ))}

        <View key="add-button">
          <TouchableOpacity
            style={[styles.menuItem, styles.addButtonItem]}
            onPress={() => {
              // Start group registration
              navigation.navigate('GroupRegistration', {
                screen: 'GroupRegistrationInfo',
              });
            }}
          >
            <Text style={styles.addButtonText}> + </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
