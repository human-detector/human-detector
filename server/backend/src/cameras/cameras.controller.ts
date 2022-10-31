import {
  Get,
  Put,
  Param,
  Controller,
  UseGuards,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { CamerasService, SendNotificationInput } from './cameras.service';
import { CameraAuthGuard } from './camera-auth.guard';
import { Collection } from '@mikro-orm/core';
import { Notification } from './notification.entity';
import { NotFoundError } from '../errors.types';

export type GetNotificationsOutput = {
  id: string;
  timestamp: string;
  camera: string;
}[];

@Controller('cameras')
@UseGuards(CameraAuthGuard)
export class CamerasController {
  constructor(private camerasService: CamerasService) {}

  @Put(':id/notifications')
  async sendNotification(
    @Param('id') id: string,
    @Body() input: SendNotificationInput,
  ): Promise<boolean> {
    try {
      const notifSent = await this.camerasService.sendNotification(id, input);
      return notifSent;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedException();
      } else {
        throw error;
      }
    }
  }

  @Get(':id/notifications')
  async getNotifications(
    @Param('id') id: string,
  ): Promise<Collection<Notification, unknown>> {
    try {
      return await this.camerasService.getNotifications(id);
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
