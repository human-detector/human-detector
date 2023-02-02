import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { Group } from '../groups/group.entity';
import { User } from './user.entity';
import { Camera } from '../cameras/camera.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, MikroOrmModule.forFeature([User, Group, Camera])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
