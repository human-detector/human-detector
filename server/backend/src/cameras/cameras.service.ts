import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundError } from '../errors.types';
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
	
	const cam = await this.notificationRepository.findOne({camera, {id, this.id}});
	if (cam === null) {
		throw new NotFoundError(`Camera with given ID does not exist.`);
	}
	await this.notificationRepository.persistAndFlush(new Notification());
	
    return true;
  }

  public async getNotifications(id: string): Promise<Notification[]> {
    /* TODO: verify ID, get the notifications */
	
	const notifications = await this.notificationRepository.findOne(
		{camera, {id, this.id}},
		{populate: ['camera.notifications']});
	if (notifications === null) {
		throw new NotFoundError(`Camera with given ID does not exist.`);
	}
    return notifications;
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
