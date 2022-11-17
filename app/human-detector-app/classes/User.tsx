// FIXME: re-evaluate methods and remove these
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Alert } from 'react-native';
import Group from './Group';

export default class User {
  username: string;

  userId: string;

  groupList: Group[];

  constructor(username: string, userId: string, groupList: Group[]) {
    this.username = username;
    this.userId = userId; // Should always be from authorization token
    this.groupList = groupList;
  }

  getGroupFromId(groupId: string) {
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
}
