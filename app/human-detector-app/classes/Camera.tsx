// FIXME: re-evaluate methods and stuff
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import Group from './Group';

export default class Camera {
  // field
  cameraId: string;

  cameraName: string;

  userId: string;

  // constructor
  constructor(userId: string, cameraName: string, cameraId: string) {
    this.cameraId = cameraId;
    this.cameraName = cameraName;
    this.userId = userId;
  }

  set setCameraName(cameraName: string) {
    this.cameraName = cameraName;
  }

  renameCamera(name: string): Camera {
    // P1
    return new Camera('0', 'name', 'ID');
  }

  isCameraOnline(): boolean {
    // P0
    return true;
  }
}

export function searchForCameras(userId: string): Camera[] {
  return new Array(5);
}

export function initializeCamera(name: string, ID: string): Camera {
  return new Camera('0', 'name', 'ID');
}

export function deleteCamera(camArr: Camera[], id: string): Camera {
  return new Camera('0', 'name', 'ID'); // deleted camera
}

export function addCameraToGroup(cam: Camera, group: Group): Group {
  return new Group('name', 'ID');
}

export function removeCameraFromGroup(): Group {
  return new Group('name', 'ID');
}

// export function removeFromAccount(): Account{

// }
