// FIXME: re-evaluate methods and remove these
/* eslint-disable array-callback-return */

import Group from './Group';
import Camera from './Camera';
import Notification from './Notification';

export default class User {
  username: string;

  userId: string;

  groupList: Group[];

  cameraMap: Map<string, Camera>;

  constructor(username: string, userId: string, groupList: Group[]) {
    this.username = username;
    this.userId = userId; // Should always be from authorization token
    this.groupList = groupList;
    this.cameraMap = new Map<string, Camera>();
  }

  getGroupFromId(groupId: string): Group | undefined {
    if (this.groupList.find((group) => group.groupId === groupId)) {
      return this.groupList.find((group) => group.groupId === groupId);
    }
    throw new Error("Group doesn't exist!");
  }

  removeGroupFromList(groupIndex: number): Group {
    if (groupIndex >= this.groupList.length) {
      throw new Error('Invalid index');
    }
    if (this.groupList[groupIndex].cameras.length > 0) {
      throw new Error("Can't remove group that has cameras!  Move cameras before removing!");
    }
    const groupRemoved = this.groupList[groupIndex];
    this.groupList.splice(groupIndex, 1);
    return groupRemoved;
  }

  getNotifsFromCams(camIdArray: string[]): Notification[] {
    const notifs: Notification[] = [];

    camIdArray.forEach((camId) => {
      const notifsFromCamera = this.cameraMap.get(camId)?.notifications;

      if (notifsFromCamera) {
        notifsFromCamera.forEach((notif) => {
          notifs.push(notif);
        });
      } else {
        console.error(`${camId} not found in the camera map`);
      }
    });
    return notifs;
  }

  makeCameraMapFromGroups(): void {
    this.groupList.forEach((group) => {
      group.cameras.forEach((cam) => {
        this.cameraMap.set(cam.cameraId, cam);
      });
    });
  }
}
