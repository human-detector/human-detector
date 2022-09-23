import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CamerasModule } from './cameras/cameras.module';

@Module({
  imports: [
    /* TODO: move config to a seperate config file.
             https://mikro-orm.io/docs/installation#setting-up-the-commandline-tool */
    MikroOrmModule.forRoot({
      autoLoadEntities: true,
    }),
    CamerasModule,
  ],
})
export class AppModule {}
