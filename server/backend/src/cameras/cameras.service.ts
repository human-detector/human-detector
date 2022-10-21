import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Notification } from './notification.entity';
import { Camera } from './camera.entity';
import { NotFoundError } from '../errors.types';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: EntityRepository<Notification>,
    @InjectRepository(Camera)
    private cameraRepository: EntityRepository<Camera>,
  ) {}

  sendNotification(id: string): boolean {
    /* TODO: verify that ID refers to a valid camera and add a notification to DB */
    return false;
  }

  getNotifications(id: string): Notification[] {
    /* TODO: verify ID, get the notifications */
    return [];
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
    return camera.token;
  }
}
