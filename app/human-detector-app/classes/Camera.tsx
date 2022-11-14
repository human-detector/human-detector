// FIXME: re-evaluate methods and stuff
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import Group from './Group';
// eslint-disable-next-line import/no-cycle
import Notification from './Notification';

export default class Camera {
  // field
  cameraId: string;

  cameraName: string;

  notifications: Notification[];

  // constructor
  constructor(cameraName: string, cameraId: string, notifications: Notification[]) {
    this.cameraId = cameraId;
    this.cameraName = cameraName;
    this.notifications = notifications;
  }
}
