// FIXME: re-evaluate methods and stuff
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line import/no-cycle
import Group from './Group';

export default class Camera {
  // field
  private cameraId: string;
  private cameraName: string;

  // constructor
  constructor(cameraName: string, cameraId: string) {
    this.cameraId = cameraId;
    this.cameraName = cameraName;
  }

  set setCameraName(cameraName: string) {
    this.cameraName = cameraName;
  }
}
