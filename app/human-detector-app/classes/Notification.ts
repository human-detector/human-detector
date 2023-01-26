import { z } from 'zod';

export default class Notification {
  id: string;

  timestamp: Date;

  snapshotId: string;

  groupId: string;

  cameraId: string;

  constructor(id: string, timestamp: Date, snapshotId: string, groupId: string, cameraId: string) {
    this.id = id;
    this.timestamp = timestamp;
    this.snapshotId = snapshotId;
    this.groupId = groupId;
    this.cameraId = cameraId;
  }
}

export const zNotification = z.object({
  id: z.string().uuid(),
  timestamp: z.string(), // FIXME: validate that this is a date
  snapshotId: z.string().uuid(),
});
export type ZNotification = z.infer<typeof zNotification>;
