import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtIdentityGuard } from '../auth/jwt-identity.guard';
import { NotFoundError } from '../errors.types';
import { UsersService } from './users.service';

export type GetGroupsOutput = {
  id: string;
  name: string;
  cameras: {
    id: string;
    name: string;
  }[];
}[];

@Controller('users')
@UseGuards(JwtIdentityGuard)
export class UsersController {
  constructor(@Inject(UsersService) private usersService: UsersService) {}

  @Get(':id/groups')
  async getGroups(@Param('id') id: string): Promise<GetGroupsOutput> {
    try {
      const groupsJSON = (await this.usersService.getGroups(id)).toJSON();
      return groupsJSON.map((group) => ({
        id: group.id,
        name: group.name,
        cameras: group.cameras.map((camera) => ({
          id: camera.id,
          name: camera.name,
        })),
      }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      } else {
        throw error;
      }
    }
  }

  @Put(':id/notifyToken')
  async updateNotifyToken(
    @Param('id') id: string,
    @Body('expoToken') notifyToken: string,
  ): Promise<void> {
    try {
      await this.usersService.updateNotifyToken(id, notifyToken);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      } else {
        throw error;
      }
    }
  }
}
