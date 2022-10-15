import {
  Get,
  Put,
  Param,
  Controller,
  UseGuards,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { CameraAuthGuard } from './camera-auth.guard';
import { Notification } from './notification.entity';
import { NotFoundError } from '../errors.types';
import { Camera } from './camera.entity';
//import { map } from 'rxjs';

export type GetNotificationsOutput = {
  id: string;
  timestamp: string;
}[];

@Controller('cameras')
@UseGuards(CameraAuthGuard)
export class CamerasController {
  constructor(private camerasService: CamerasService) {}

  /* TODO: this endpoint needs an auth guard */
  @Put(':id/notifications')
  async sendNotification(@Param('id') id: string): Promise<boolean> {
    try {
      const notifSent = await this.camerasService.sendNotification(id);
      return notifSent;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedException();
      } else {
        throw error;
      }
    }
  }

  /* TODO: this endpoint needs an auth guard */
  @Get(':id/notifications')
  async getNotifications(
    @Param('id') id: string,
  ): Promise<GetNotificationsOutput> {
    try {
      const notificationsJSON = (
        await this.camerasService.getNotifications(id)
      ).toJSON();
      return notificationsJSON.map((notifications) => ({
        id: notifications.id,
        timestamp: notifications.timestamp,
      }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedException();
      } else {
        throw error;
      }
    }
  }

  // FIXME: do the cameras need to send a heartbeat?
  @Put(':id/heartbeat')
  heartbeat(@Param('id') id: string) {
    return '';
  }
}
