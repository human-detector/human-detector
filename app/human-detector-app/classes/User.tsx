// FIXME: re-evaluate methods and remove these
/* eslint-disable array-callback-return */

import Group from './Group';
import Notification from './Notification';

export default class User {
  username: string;

  userId: string;

  groupList: Group[];

  constructor(username: string, userId: string, groupList: Group[]) {
    this.username = username;
    this.userId = userId; // Should always be from authorization token
    this.groupList = groupList;
  }

  getGroupFromId(groupId: string): Group | undefined {
    if (this.groupList.find((group) => group.groupId === groupId)) {
      return this.groupList.find((group) => group.groupId === groupId);
    }
    throw new Error("Group doesn't exist!");
  }

  removeGroupFromList(groupIndex: number): Group {
    if (groupIndex > this.groupList.length) {
      throw new Error('Invalid index');
    }
    if (this.groupList[groupIndex].cameras.length > 0) {
      throw new Error("Can't remove group that has cameras!  Move cameras before removing!");
    }
    const groupRemoved = this.groupList[groupIndex];
    this.groupList.splice(groupIndex, 1);
    return groupRemoved;
  }

  getAllNotifications(): Notification[] {
    const notifs: Notification[] = [];

    this.groupList.map((group) => {
      group.cameras.map((cam) => {
        cam.notifications.map((notif) => {
          notifs.push(notif);
        });
      });
    });
    return notifs;
  }
}
