import { Inject, Injectable } from '@nestjs/common';
import { Collection, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundError } from '../errors.types';
import { Notification } from './notification.entity';
import { Camera } from './camera.entity';
import {
  IPushNotification,
  IPushNotificationsService,
  IPUSH_NOTIFICATIONS_SERVICE_TOKEN,
} from './push-notifications/push-notifications-service.interface';
import { Snapshot } from '../snapshots/snapshot.entity';
import { ImageBuffer } from './image-buffer';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(Camera)
    private cameraRepository: EntityRepository<Camera>,
    @InjectRepository(Notification)
    private notificationRepository: EntityRepository<Notification>,
    @Inject(IPUSH_NOTIFICATIONS_SERVICE_TOKEN)
    private pushNotificationsService: IPushNotificationsService,
  ) {}

  /**
   * Sends a notification to the user's phone and adds it to the
   * collection of notifications the user has.
   * @param idCam
   * @param frame Image to associate with this notification. No validation is done on this
   * frame data, so check your buffer beforehand.
   */
  public async sendNotification(
    idCam: string,
    frame: ImageBuffer,
  ): Promise<boolean> {
    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      { populate: ['group.user'] },
    );

    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }

    const pushToken = cam.group.user.expoToken;
    const pushNotification: IPushNotification = {
      sound: 'default',
      title: `${cam.name} has detected movement!`,
      body: 'This is a test notification',
      data: { withSome: 'data' },
    };
    try {
      await this.pushNotificationsService.sendPushNotification(
        pushToken,
        pushNotification,
      );
    } catch (error) {
      console.error('Error sending push notification', error);
    }

    cam.notifications.add(new Notification(new Snapshot(frame)));
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
      { populate: ['notifications', 'notifications.camera.id'] },
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
