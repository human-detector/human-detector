import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {View} from 'react-native';

import Group from '../group/Group';

export default class Camera {
  cameraName:string
  cameraID:string
  
  constructor(cameraName:string, cameraID:string){
    this.cameraName = cameraName
    this.cameraID = cameraID
  }

  set setCameraName(cameraName:string){
      this.cameraName = cameraName
  }

}

export function searchForCameras(): Camera[]{
  return new Array(5)
}

export function renameCamera(cam:Camera): Camera{
  return new Camera('name', 'ID')
}

export function isCameraOnline(cam:Camera): boolean{
    return true
}


export function initializeCamera(name:string, ID:string): Camera{
    return new Camera('name', 'ID')
}


export function deleteCamera(camArr:Camera[], id:string): Camera{
    return new Camera('name', 'ID') //deleted camera
}

export function addCameraToGroup(cam:Camera, group:Group): Group {
  return new Group('name', 'ID')

}

export function removeCameraFromGroup(): Group {
  return new Group('name', 'ID')
}

// export function removeFromAccount(): Account{

// }