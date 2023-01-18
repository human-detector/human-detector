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
      { populate: ['group.id', 'group.user'] },
    );

    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }

    const notification = new Notification(new Snapshot(frame));
    cam.notifications.add(notification);
    await this.cameraRepository.flush();

    const pushToken = cam.group.user.expoToken;
    const pushNotification: IPushNotification = {
      sound: 'default',
      title: `${cam.name} has detected movement!`,
      body: 'Tap for more info',
      data: {
        groupId: cam.group.id,
        cameraId: cam.id,
        notification: {
          id: notification.id,
          timestamp: notification.timestamp,
          snapshotId: notification.snapshot.id,
        },
      },
    };
    try {
      await this.pushNotificationsService.sendPushNotification(
        pushToken,
        pushNotification,
      );
    } catch (error) {
      console.error('Error sending push notification', error);
    }

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
   * Removes all notifications associated with Camera idCam.
   * @param idCam
   */
  public async removeNotifications(
    idCam: string,
  ): Promise<Boolean> {
    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      { populate: ['notifications', 'notifications.camera.id'] },
    );

    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }

    // First goes through and removes the notifs one-by-one
    // Check to see if this works on a collection of notifs.
    for (const notif of cam.notifications) {
      cam.notifications.remove(notif);
      await this.cameraRepository.flush();
    }

    // This is to check that no more notifications from the given camera are still in the repository.
    const notifications = await this.notificationRepository.findAll();
    for (const newNotif of notifications) {
      if (newNotif.camera.id === idCam) {
        throw new Error(`During removal of '${cam.name}'s notifications, a notification affiliated with said camera was found.`)
      }
    }

    return true;
  }

  /**
   * Removes a given camera from one of the user's groups.
   * @param idCam
   */
  public async removeCamera(
    idCam: string,
  ): Promise<Boolean> {
    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      { populate: ['group.cameras'] },
    );

    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }
    // removes notifications before removing the camera.
    if (this.removeNotifications(idCam)) {
      //cam.group.cameras.remove(cam);
      this.cameraRepository.remove(cam)
      await this.cameraRepository.flush();
    }
    else {
      throw new Error(`During the removal of notifications, there was an error and the deletion of the camera will not proceed.`);
    }

    return true;
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
