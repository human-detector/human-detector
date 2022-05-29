import { Put, Param, Controller } from '@nestjs/common';
import { CamerasService } from './cameras.service';

@Controller('cameras')
export class CamerasController {
  constructor(private camerasService: CamerasService) {}

  /* TODO: this endpoint needs an auth guard */
  @Put(':id/notifications')
  sendNotification(@Param('id') id: string): boolean {
    return this.camerasService.sendNotification(id);
  }
}
