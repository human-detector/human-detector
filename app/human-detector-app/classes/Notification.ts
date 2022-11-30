import { z } from 'zod';

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

export const zNotification = z
  .object({
    id: z.string().uuid(),
    timestamp: z.string(), // FIXME: validate that this is a date
    snapshotId: z.string().uuid(),
  })
  .transform(
    (zodNotif) => new Notification(zodNotif.id, new Date(zodNotif.timestamp), zodNotif.snapshotId)
  );
export type ZNotification = z.infer<typeof zNotification>;
