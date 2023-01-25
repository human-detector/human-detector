// FIXME: figure it out :(
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import Camera from './Camera';

export default class Group {
  groupName: string;

  groupId: string;

  cameras: Camera[];

  constructor(groupName: string, groupID: string, cameras: Camera[]) {
    this.groupName = groupName;
    this.groupId = groupID;
    this.cameras = cameras;
  }

  getCameraFromId(cameraId: string): Camera | undefined {
    if (this.cameras.find((camera) => camera.cameraId === cameraId)) {
      return this.cameras.find((camera) => camera.cameraId === cameraId);
    }
    throw new Error("Group doesn't exist!");
  }

  addCameraToGroup(newCam: Camera) {
    this.cameras.push(newCam);
  }

  removeCameraFromGroup(camerasIndex: number) {
    this.cameras.splice(camerasIndex, 1);
  }
}
