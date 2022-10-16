import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CamerasModule } from './cameras/cameras.module';
import { UsersModule } from './users/users.module';

import appConfig from '../config';
import dbConfig from '../mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    MikroOrmModule.forRoot(dbConfig),
    CamerasModule,
    UsersModule,
  ],
})
export class AppModule {}
