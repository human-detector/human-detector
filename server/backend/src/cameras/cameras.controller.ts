import { Get, Put, Param, Controller } from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { Notification } from './notification.entity';

@Controller('cameras')
export class CamerasController {
  constructor(private camerasService: CamerasService) {}

  /* TODO: this endpoint needs an auth guard */
  @Put(':id/notifications')
  sendNotification(@Param('id') id: string): boolean {
    return this.camerasService.sendNotification(id);
  }

  /* TODO: this endpoint needs an auth guard */
  @Get(':id/notifications')
  getNotifications(@Param('id') id: string): Notification[] {
    return this.camerasService.getNotifications(id);
  }
}
