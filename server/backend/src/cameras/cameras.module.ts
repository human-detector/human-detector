import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';
import { Notification } from './notification.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Notification])],
  controllers: [CamerasController],
  providers: [CamerasService],
})
export class CamerasModule {}
