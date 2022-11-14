import Camera from './Camera';

export default class Notification {
  id: string;

  timestamp: Date;

  camera: Camera;

  snapshotId: string;

  constructor(id: string, timestamp: Date, camera: Camera, snapshotId: string) {
    this.id = id;
    this.timestamp = timestamp;
    this.camera = camera;
    this.snapshotId = snapshotId;
  }
}
