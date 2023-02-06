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

  addCameraToGroup(newCam: Camera) {
    this.cameras.push(newCam);
  }

  removeCameraFromGroup(camerasIndex: number) {
    this.cameras.splice(camerasIndex, 1);
  }
}
