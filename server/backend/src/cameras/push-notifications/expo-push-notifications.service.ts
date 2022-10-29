import { ConfigService } from '@nestjs/config';
import Expo from 'expo-server-sdk';
import {
  IPushNotification,
  IPushNotificationsService,
} from './push-notifications-service.interface';

export class ExpoPushNotificationsService implements IPushNotificationsService {
  private expoClient: Expo | null;

  constructor(private configService: ConfigService) {}

  public sendPushNotification(
    pushToken: string,
    notification: IPushNotification,
  ): Promise<void> {
    if (this.expoClient === null) {
      this.expoClient = new Expo({
        accessToken: this.configService.getOrThrow<string>('expo.access_token'),
      });
    }
    return this.expoClient
      .sendPushNotificationsAsync([{ to: pushToken, ...notification }])
      .then(() => {
        return undefined;
      });
  }
}
