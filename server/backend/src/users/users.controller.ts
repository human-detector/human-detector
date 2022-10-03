import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
} from '@nestjs/common';
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
}
