import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, TouchableOpacity } from 'react-native';

export default function App() {
  const cameraObj:Camera = new Camera("testing things over here", "3826847623784923")

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
      <ButtonTest cameraName = "Camera 1"/>
      <ButtonTest cameraName = "Camera 2"/>
      <ButtonTestTwo cameraName = "Camera 3" function = {testFunction} ></ButtonTestTwo>
      <DisplayCameraButton camera={ cameraObj } />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function ButtonTest({ cameraName }) {
  
  return (
    <View>
      <Button 
      onPress = {() => 
        Alert.alert(`Why does this not work`)
      }
      title = {cameraName}
      />
    </View>
  )
}

const testFunction = () => {
  Alert.alert(`This is the testFunction alert`)
}

function ButtonTestTwo({ cameraName, function2 }){
  return(
    <View>
      <TouchableOpacity onPress={() => { Alert.alert(`Whatt about this`)}} style = {styles2.appButtonContainer}>
        <Text style={styles2.appButtonText}>{cameraName}</Text>  
      </TouchableOpacity>
    </View>
  )
}

const styles2 = StyleSheet.create({
  // ...
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "#009688",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  }
});


class Camera {
  cameraName:string;
  cameraID:string;

  constructor(cameraName:string, cameraID:string){
    this.cameraName = cameraName
    this.cameraID = cameraID
  }
}

export function DisplayCameraButton({ camera }:MessageProp){
  return (
  <View>
    <Button 
    title = {camera.cameraName}
    onPress = {() => {
      Alert.alert(`Does this work`)
    }}
    />
  </View>
)};