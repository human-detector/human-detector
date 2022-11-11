import { ImageBuffer } from '../../src/cameras/image-buffer';
import { Notification } from '../../src/cameras/notification.entity';
import { Snapshot } from '../../src/snapshots/snapshot.entity';

export function notificationWithDummySnapshot(): Notification {
  const notification = new Notification();
  notification.snapshot = new Snapshot(
    Buffer.from(Buffer.from(notification.id).toString('base64')) as ImageBuffer,
  );
  return notification;
}
