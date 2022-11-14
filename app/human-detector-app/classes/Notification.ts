export default class Notification {
  id: string;

  timestamp: Date;

  snapshotId: string;

  constructor(id: string, timestamp: Date, snapshotId: string) {
    this.id = id;
    this.timestamp = timestamp;
    this.snapshotId = snapshotId;
  }
}
