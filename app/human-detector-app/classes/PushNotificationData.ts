import { z } from 'zod';
import { zNotification } from './Notification';

export const zPushNotificationData = z.object({
  groupId: z.string().uuid(),
  cameraId: z.string().uuid(),
  notification: zNotification,
});
export type ZPushNotificationData = z.infer<typeof zPushNotificationData>;
