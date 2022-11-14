import { Notification } from '../../src/cameras/notification.entity';
import { defaultSnapshot } from './snapshot';

export function notificationWithDummySnapshot(): Notification {
  return new Notification(defaultSnapshot());
}
