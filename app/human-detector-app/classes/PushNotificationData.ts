import { z } from 'zod';
import Notification, { zNotification } from './Notification';

export const zPushNotificationData = z
  .object({
    groupId: z.string().uuid(),
    cameraId: z.string().uuid(),
    notification: zNotification,
  })
  .transform(
    (zodNotif) =>
      new Notification(
        zodNotif.notification.id,
        new Date(zodNotif.notification.timestamp),
        zodNotif.notification.snapshotId,
        zodNotif.groupId,
        zodNotif.cameraId
      )
  );
export type ZPushNotificationData = z.infer<typeof zPushNotificationData>;
