export const IPUSH_NOTIFICATIONS_SERVICE_TOKEN = 'IPushNotificationsService';

// Mostly a copy of Expo's 'ExpoPushMessage'.
export interface IPushNotification {
  data?: object;
  title?: string;
  subtitle?: string;
  body?: string;
  sound?:
    | 'default'
    | null
    | {
        critical?: boolean;
        name?: 'default' | null;
        volume?: number;
      };
  ttl?: number;
  expiration?: number;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
  channelId?: string;
}

/**
 * Handles sending push notifications via an opaque push token.
 */
export interface IPushNotificationsService {
  sendPushNotification(
    pushToken: string,
    notification: IPushNotification,
  ): Promise<void>;
}
