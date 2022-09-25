import {useState} from "react";
import Camera from "../classes/Camera";
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CameraSettingsButton from "../components/CameraSettingsButton";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function CameraScreen(){
  let cameraOne:Camera = new Camera("123", "AAAAA's Camera", "99");
  let cameraTwo:Camera = new Camera("124", "BBBBB's Camera", "725");
  let cameraThree:Camera = new Camera("125", "CCCCC's Camera", "400");

  const[listOfCameras, setListOfCameras] = useState([cameraOne, cameraTwo, cameraThree])

  return (
      <View style={styles.container}>
          <ScrollView>
              { listOfCameras.map((item) => {
                  return (
                      <View key={item.cameraId}>
                          <TouchableOpacity
                              style={styles.menuItem}
                              onPress = {() => {
                                  setListOfCameras([item]);
                              }}
                          >
                              <Text style={styles.menuButtonText}> {item.cameraName} </Text>
                              <CameraSettingsButton cameraId={item.cameraId}></CameraSettingsButton>
                          </TouchableOpacity>
                      </View>
                  )
              })}

              <View key={'add-button'}>
                  <TouchableOpacity
                      style={[styles.menuItem, styles.addButtonItem]}
                      onPress = {() => {
                          const cameraList: Camera[] = [...listOfCameras];
                          //adding camera here test
                          cameraList.push(new Camera("test", "test", "test"));
                          setListOfCameras(cameraList);
                      }}
                  >
                      <Text style={styles.addButtonText}> + </Text>
                  </TouchableOpacity>
              </View>
          </ScrollView>
      </View>
  );
}

export function CameraOnPress(){

}

export function CameraDisplayButton(){
    
}

export function getCameraThumbnail(){

}

export function getCameraStream(){

}

export function isCameraOnline(): boolean{
    return true
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      //paddingTop: 40,
      //paddingHorizontal: 20
  },
  textInput: {
      borderWidth: 1,
      borderColor: '#777',
      padding: 8,
  },
  pads: {
      padding: 10
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
      borderColor: '#D3D3D3'
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

  