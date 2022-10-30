import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { Notification } from './notification.entity';
import { Camera } from './camera.entity';
import { CameraAuthGuard } from './camera-auth.guard';
import { IPUSH_NOTIFICATIONS_SERVICE_TOKEN } from './push-notifications/push-notifications-service.interface';
import { ExpoPushNotificationsService } from './push-notifications/expo-push-notifications.service';

@Module({
  imports: [MikroOrmModule.forFeature([Camera, Notification])],
  controllers: [CamerasController],
  providers: [
    CameraAuthGuard,
    CamerasService,
    {
      provide: IPUSH_NOTIFICATIONS_SERVICE_TOKEN,
      useClass: ExpoPushNotificationsService,
    },
  ],
})
export class CamerasModule {}
