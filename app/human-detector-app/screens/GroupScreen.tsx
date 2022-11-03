import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CameraSettingsButton from '../components/CameraSettingsButton';
import Group from '../classes/Group';
import { RootStackParamList } from '../src/navigation/stackParamList';

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

type Props = NativeStackScreenProps<RootStackParamList, 'Groups'>
export default function GroupScreen({ navigation }: Props): React.ReactElement {
  const groupOne: Group = new Group("AAAAAA's Group", '99');
  const groupTwo: Group = new Group("BBBBB's Group", '725');
  const groupThree: Group = new Group("CCCCC's Group", '400');

  const [listOfGroups, setListOfGroups] = useState<Group[]>([]);
  React.useEffect(() => {
    setListOfGroups([groupOne, groupTwo, groupThree]);
  }, []);

  const pressHandler = () => {
    navigation.navigate('Cameras');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {listOfGroups.map((item) => (
          <View key={item.groupId}>
            <TouchableOpacity style={styles.menuItem} onPress={pressHandler}>
              <Text style={styles.menuButtonText}> {item.groupName} </Text>
              <CameraSettingsButton cameraId={item.groupId} />
            </TouchableOpacity>
          </View>
        ))}

        <View key="add-button">
          <TouchableOpacity
            style={[styles.menuItem, styles.addButtonItem]}
            onPress={() => {
              // TODO: Add a new group
              console.log('You added a group!');
            }}
          >
            <Text style={styles.addButtonText}> + </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export function GroupOnPress() {
  return (
    <View>
      <Text> Placeholder </Text>
    </View>
  );
}

export function GroupDisplayButton() {
  return (
    <View>
      <Text> Placeholder </Text>
    </View>
  );
}
