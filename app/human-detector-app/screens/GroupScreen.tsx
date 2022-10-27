import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CameraSettingsButton from '../components/CameraSettingsButton';
import Group from '../classes/Group';

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

// FIXME: Define the route params object (first param to the 'NativeStackScreenProps' type) in one central file
//        so each component can use it. The dummy object here is a placeholder to pass typechecking.
export default function GroupScreen({
  navigation,
}: NativeStackScreenProps<{ Group: undefined; Cameras: undefined }, 'Group'>): React.ReactElement {
  const groupOne: Group = new Group("AAAAAA's Group", '99');
  const groupTwo: Group = new Group("BBBBB's Group", '725');
  const groupThree: Group = new Group("CCCCC's Group", '400');

  const [listOfGroups, setListOfGroups] = useState([groupOne, groupTwo, groupThree]);

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
            onPress={() =>
              setListOfGroups((oldGroups) => [...oldGroups, new Group('test', 'test')])
            }
          >
            <Text style={styles.addButtonText}> + </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>

    /*
     * Instead of doing FlatList, I might want to change this to a scrollable view
     */
    //   <SafeAreaView style={styles.container}>
    //     <FlatList
    //         data={listOfCameras}
    //         renderItem={renderItem}
    //     />
    //   </SafeAreaView>
    //
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
