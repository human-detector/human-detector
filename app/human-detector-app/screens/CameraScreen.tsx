import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CameraSettingsButton from '../components/CameraSettingsButton';
import Camera from '../classes/Camera';

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

export default function CameraScreen({ navigation }): React.ReactElement {
  const cameraOne: Camera = new Camera('123', "AAAAA's Camera", '99');
  const cameraTwo: Camera = new Camera('124', "BBBBB's Camera", '725');
  const cameraThree: Camera = new Camera('125', "CCCCC's Camera", '400');

  const [listOfCameras, setListOfCameras] = useState([cameraOne, cameraTwo, cameraThree]);

  return (
    <View style={styles.container}>
      <ScrollView>
        {listOfCameras.map((item) => (
          <View key={item.cameraId}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setListOfCameras([item]);
              }}
            >
              <Text style={styles.menuButtonText}> {item.cameraName} </Text>
              <CameraSettingsButton cameraId={item.cameraId} />
            </TouchableOpacity>
          </View>
        ))}

        <View key="add-button">
          <TouchableOpacity
            style={[styles.menuItem, styles.addButtonItem]}
            onPress={() => {
              // Start camera registration process
              navigation.navigate('Bluetooth');
            }}
          >
            <Text style={styles.addButtonText}> + </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export function CameraOnPress() {}

export function CameraDisplayButton() {}

export function getCameraThumbnail() {}

export function getCameraStream() {}

export function isCameraOnline(): boolean {
  return true;
}
