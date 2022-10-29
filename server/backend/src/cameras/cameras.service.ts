import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundError } from '../errors.types';
import { Notification } from './notification.entity';
import { Camera } from './camera.entity';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(Camera)
    private cameraRepository: EntityRepository<Camera>,
    @InjectRepository(Notification)
    private notificationRepository: EntityRepository<Notification>,
    private configService: ConfigService,
  ) {}

  /**
   * Sends a notification to the user's phone and adds it to the
   * collection of notifications the user has.
   * @param idCam
   */
  public async sendNotification(idCam: string): Promise<boolean> {
    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      { populate: ['group.user'] },
    );

    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }
    const expoClient = new Expo({
      accessToken: this.configService.get<string>('expo.access_token'),
    });

    const messages = [];
    const expoToken = cam.group.user.expoToken;

    if (!Expo.isExpoPushToken(expoToken)) {
      console.error(`Push token ${expoToken} is not a valid Expo push token`);
    }

    messages.push({
      to: expoToken,
      sound: 'default',
      title: `${cam.name} has detected movement!`,
      body: 'This is a test notification',
      data: { withSome: 'data' },
    });
    try {
      const sent = await expoClient.sendPushNotificationsAsync(messages);
    } catch (error) {
      console.error(error);
    }

    cam.notifications.add(new Notification());
    this.cameraRepository.flush();
    return true;
  }

  /**
   * Gets a user's notification collection
   * @param idCam
   */
  public async getNotifications(
    idCam: string,
  ): Promise<Collection<Notification>> {
    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      { populate: ['notifications'] },
    );
    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }
    return cam.notifications;
  }

  /**
   * Get a camera's PEM-encoded public key.
   * @param id
   */
  public async getPublicKey(id: string): Promise<string> {
    const camera = await this.cameraRepository.findOne({ id });
    if (camera === undefined) {
      throw new NotFoundError(`No camera with ID "${id}" exists`);
    }
    return camera.publicKey;
  }
}
