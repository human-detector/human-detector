import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Expo from 'expo-server-sdk';
import {
  IPushNotification,
  IPushNotificationsService,
} from './push-notifications-service.interface';

@Injectable()
export class ExpoPushNotificationsService implements IPushNotificationsService {
  private expoClient: Expo;

  constructor(private configService: ConfigService) {
    this.expoClient = new Expo({
      accessToken: this.configService.getOrThrow<string>('expo.access_token'),
    });
  }

  public sendPushNotification(
    pushToken: string,
    notification: IPushNotification,
  ): Promise<void> {
    return this.expoClient
      .sendPushNotificationsAsync([{ to: pushToken, ...notification }])
      .then(() => {
        return undefined;
      });
  }
}
