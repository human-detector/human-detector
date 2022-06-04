import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function CameraScreen(){

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

export class Camera {
  cameraName:string;
  cameraID:string;
  
  constructor(cameraName:string, cameraID:string){
    this.cameraName = cameraName
    this.cameraID = cameraID
    console.log(cameraName);
    console.log(cameraID);
  }
}

//module.exports = isCameraOnline;

  