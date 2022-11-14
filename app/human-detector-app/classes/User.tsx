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
    return this.groupList.find((group) => group.groupId === groupId);
  }

  addGroupToList(newGroup: Group): boolean {
    this.groupList.push(newGroup);
    return true;
  }

  removeGroupFromList(groupIndex: number): boolean {
    if (this.groupList[groupIndex].cameras.length > 0) {
      Alert.alert("Can't remove group that has cameras!  Move cameras before removing!");
      return false;
    }
    this.groupList.splice(groupIndex);
    return true;
  }
}
