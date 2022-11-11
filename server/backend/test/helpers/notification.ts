import { ImageBuffer } from '../../src/cameras/image-buffer';
import { Notification } from '../../src/cameras/notification.entity';
import { Snapshot } from '../../src/snapshots/snapshot.entity';
import { v4 } from 'uuid';

export function notificationWithDummySnapshot(): Notification {
  const snapshot = new Snapshot(
    Buffer.from(Buffer.from(v4()).toString('base64')) as ImageBuffer,
  );
  return new Notification(snapshot);
}
