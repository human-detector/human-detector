import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamerasModule } from './cameras/cameras.module';

@Module({
  imports: [CamerasModule],
})
export class AppModule {}
