import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Notification } from './notification.entity';

@Injectable()
export class CamerasService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: EntityRepository<Notification>,
  ) {}

  sendNotification(id: string): boolean {
    /* TODO: verify that ID refers to a valid camera and add a notification to DB */
    return false;
  }

  getNotifications(id: string): Notification[] {
    /* TODO: verify ID, get the notifications */
    return [];
  }
}
