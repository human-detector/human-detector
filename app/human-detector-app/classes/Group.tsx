// FIXME: figure it out :(
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import Camera from './Camera';

export default class Group {
  private groupName: string;

  private groupId: string;

  private cameras: Camera[];

  constructor(groupName: string, groupID: string, cameras: Camera[]) {
    this.groupName = groupName;
    this.groupId = groupID;
    this.cameras = cameras;
  }

  get getGroupId(): string {
    return this.groupId;
  }

  get getGroupName(): string {
    return this.groupName;
  }

  get getCameras(): Camera[] {
    return this.cameras;
  }

  addCameraToGroup(newCam: Camera) {
    this.cameras.push(newCam);
  }

  removeCameraFromGroup(camerasIndex: number) {
    this.cameras.splice(camerasIndex);
  }
}
