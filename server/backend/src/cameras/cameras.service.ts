import { Injectable } from '@nestjs/common';

/* FIXME: this should probably move to a different file */
export type Notification = {
  date: Date;
};

@Injectable()
export class CamerasService {
  sendNotification(id: string): boolean {
    /* TODO: verify that ID refers to a valid camera and add a notification to DB */
    return false;
  }

  getNotifications(id: string): Notification[] {
    /* TODO: verify ID, get the notifications */
    return [];
  }
}
