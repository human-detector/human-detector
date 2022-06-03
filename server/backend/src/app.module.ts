import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamerasModule } from './cameras/cameras.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    /* TODO: move config to a seperate config file.
             https://mikro-orm.io/docs/installation#setting-up-the-commandline-tool */
    MikroOrmModule.forRoot({
      autoLoadEntities: true,
    }),
    CamerasModule,
    AuthModule],
})
export class AppModule {}
