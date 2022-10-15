import { Injectable } from '@nestjs/common';
import { Collection, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundError } from '../errors.types';
import { Notification } from './notification.entity';
import { Camera } from './camera.entity';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(Camera)
    private cameraRepository: EntityRepository<Camera>,
    @InjectRepository(Notification)
    private notificationRepository: EntityRepository<Notification>,
  ) {}

  public async sendNotification(idCam: string): Promise<boolean> {
    /* TODO: verify that ID refers to a valid camera and add a notification to DB */
    const cam = await this.cameraRepository.findOne({ id: idCam });
    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }
    cam.notifications.add(new Notification());
    this.cameraRepository.flush();
    return true;
  }

  public async getNotifications(
    idCam: string,
  ): Promise<Collection<Notification>> {
    /* TODO: verify ID, get the notifications */

    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      { populate: ['notifications'] },
    );
    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }
    //const notifications = await this.notificationRepository.find({ id: idCam });
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
