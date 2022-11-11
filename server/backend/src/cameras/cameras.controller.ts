import {
  Get,
  Put,
  Param,
  Controller,
  UseGuards,
  UnauthorizedException,
  Body,
  UsePipes,
} from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { CameraAuthGuard } from './camera-auth.guard';
import { NotFoundError } from '../errors.types';
import { Base64ImageValidationPipe } from './base64-image-validation.pipe';
import { ImageBuffer } from './image-buffer';

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
  @UsePipes(new Base64ImageValidationPipe([{ type: 'body', name: 'frame' }]))
  async sendNotification(
    @Param('id') id: string,
    @Body('frame') frame: ImageBuffer,
  ): Promise<boolean> {
    try {
      const notifSent = await this.camerasService.sendNotification(id, frame);
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
  ): Promise<GetNotificationsOutput> {
    try {
      const notifications = await this.camerasService.getNotifications(id);
      return notifications.toJSON().map((notification) => ({
        id: notification.id,
        timestamp: notification.timestamp,
        camera: notification.camera.id,
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
