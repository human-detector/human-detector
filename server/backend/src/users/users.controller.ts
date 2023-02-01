import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtIdentityGuard } from '../auth/jwt-identity.guard';
import { NotFoundError } from '../errors.types';
import { UsersService } from './users.service';
import { UnauthorizedException } from '@nestjs/common/exceptions';

export type GetGroupsOutput = {
  id: string;
  name: string;
  cameras: {
    id: string;
    name: string;
    notifications: {
      id: string;
      timestamp: string;
      snapshotId: string;
    }[];
  }[];
}[];

export type RegisterCameraBody = {
  publicKey?: string;
  serial?: string;
  name?: string;
};

export type RegisterCameraResponse = {
  id: string;
};

export type RegisterGroupResponse = {
  id: string;
};

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
          notifications: camera.notifications.map((notification) => ({
            id: notification.id,
            timestamp: notification.timestamp,
            snapshotId: notification.snapshot.id,
          })),
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

  @Put(':id/groups')
  async registerGroup(
    @Param('id') userId: string,
    @Body('name') groupName: string,
  ): Promise<RegisterGroupResponse> {
    if (groupName === undefined) {
      throw new BadRequestException();
    }

    try {
      const group = await this.usersService.registerGroup(userId, groupName);

      return { id: group.id };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      } else {
        throw error;
      }
    }
  }

  @Delete(':id/groups/:name')
  async deleteGroup(
    @Param('id') userId: string,
    @Param('name') groupId: string,
  ): Promise<boolean> {
    try {
      const groupRemoved = await this.usersService.deleteGroup(userId, groupId);
      return groupRemoved;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedException();
      } else {
        throw error;
      }
    }
  }

  @Put(':uid/groups/:gid/cameras')
  async registerCamera(
    @Param('uid') userId: string,
    @Param('gid') groupId: string,
    @Body() body: RegisterCameraBody,
  ): Promise<RegisterCameraResponse> {
    if (
      body.name === undefined ||
      body.publicKey === undefined ||
      body.serial === undefined
    ) {
      throw new BadRequestException();
    }

    try {
      const camera = await this.usersService.registerCamera(
        userId,
        groupId,
        body,
      );

      return {
        id: camera.id,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      } else {
        throw error;
      }
    }
  }

  @Delete(':id/groups/:gid/cameras/:cid')
  async removeCamera(
    @Param('id') userId: string,
    @Param('gid') groupId: string,
    @Param('cid') cameraId: string,
  ): Promise<boolean> {
    try {
      console.log('hello');
      const camRemoved = await this.usersService.removeCamera(
        userId,
        groupId,
        cameraId,
      );
      return camRemoved;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedException();
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
