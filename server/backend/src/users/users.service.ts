import { Collection, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from '../errors.types';
import { Camera } from '../cameras/camera.entity';
import { Group } from '../groups/group.entity';
import { User } from './user.entity';
import { RegisterCameraBody } from './users.controller';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: EntityRepository<User>,
    @InjectRepository(Group) private groupRepository: EntityRepository<Group>,
  ) {}

  /**
   * Gets the given user's camera groups.
   *
   * @param userId the user's ID.
   * @throws {@link NotFoundError}
   * Thrown if the given user ID doesn't correspond to an existing user.
   */
  public async getGroups(userId: string): Promise<Collection<Group>> {
    const user = await this.usersRepository.findOne(
      { id: userId },
      {
        populate: [
          'groups.cameras',
          'groups.cameras.notifications',
          'groups.cameras.notifications.snapshot.id',
        ],
      },
    );
    if (user === null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist.`);
    }
    return user.groups;
  }

  /**
   * Register a camera to the given user and group
   *
   * @param userId the user's ID.
   * @param groupId the group ID.
   * @param ncameraDetails the name, serial, and public key of a new camera.
   */
  public async registerCamera(
    userId: string,
    groupId: string,
    cameraDetails: RegisterCameraBody,
  ): Promise<Camera> {
    const group = await this.groupRepository.findOne(
      { id: groupId },
      { populate: ['user', 'cameras'] },
    );

    if (group === null) {
      throw new NotFoundError(`Group with ID "${groupId}" does not exist.`);
    }

    if (group.user.id !== userId) {
      throw new NotFoundError(`User with ID "${userId}" does not exist.`);
    }

    const newCamera = new Camera(
      cameraDetails.name,
      cameraDetails.publicKey,
      cameraDetails.serial,
    );

    group.cameras.add(newCamera);
    await this.groupRepository.flush();

    return newCamera;
  }

  /**
   * Update's the user's push notification token.
   *
   * @param userId the user's ID.
   * @param notifyToken the new notification token.
   */
  public async updateNotifyToken(
    userId: string,
    notifyToken: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (user === null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist.`);
    }
    user.expoToken = notifyToken;
    await this.usersRepository.flush();
  }
}
