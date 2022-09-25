import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CamerasModule } from './cameras/cameras.module';
import { UsersModule } from './users/users.module';

import config from '../mikro-orm.config';

@Module({
  imports: [MikroOrmModule.forRoot(config), CamerasModule, UsersModule],
})
export class AppModule {}
