// FIXME: figure it out :(
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import Camera from './Camera';

export default class Group {
  groupName: string;

  groupId: string;

  cameras: Camera[];

  constructor(groupName: string, groupID: string) {
    this.groupName = groupName;
    this.groupId = groupID;
    this.cameras = [];
  }
}

export function renameGroup(newName: string, group: Group): Group {
  return new Group('name', 'ID');
}

export function addToGroup(newCam: Camera, group: Group): Group {
  return new Group('name', 'ID');
}
