import {
  BadRequestException,
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

export type RegisterCameraBody = {
  publicKey?: string;
  serial?: string;
  name?: string;
}

export type RegisterCameraResponse = {
  id: string;
}

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

  @Put(':uid/groups/:gid/cameras')
  async putCamera(
    @Param('uid') userId: string,
    @Param('gid') groupId: string,
    @Body() body: RegisterCameraBody 
  ): Promise<RegisterCameraResponse> {
    if (Object.values(body).includes(undefined)) {
      throw new BadRequestException();
    }

    try {
      const camera = await this.usersService.registerCamera(
        userId,
        groupId,
        body
      );

      return {
        id: camera.id
      };
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
