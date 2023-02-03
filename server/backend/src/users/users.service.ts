import { Collection, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
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
    @InjectRepository(Camera)
    private cameraRepository: EntityRepository<Camera>,
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
   * Register a group to the given user
   *
   * @param userId the user's ID
   * @param groupName the name of the group that it is to be given
   */

  public async registerGroup(
    userId: string,
    groupName: string,
  ): Promise<Group> {
    // find and populate user.groups
    const user = await this.usersRepository.findOne(
      { id: userId },
      { populate: ['groups'] },
    );

    if (user == null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist`);
    }

    if (user.id != userId) {
      throw new NotFoundError(`Pulled user with wrong ID!`);
    }

    // Make an empty group
    const newGroup = new Group(groupName);
    user.groups.add(newGroup);

    await this.usersRepository.flush();
    return newGroup;
  }

  /**
   * Deletes a given group from the user's list of created groups.
   *
   * @param userId the user's ID
   * @param groupId the group ID that is going to be deleted
   */
  public async deleteGroup(userId: string, groupId: string): Promise<boolean> {
    // finds user and then groupObj from the parameters.
    const user = await this.usersRepository.findOne(
      { id: userId },
      { populate: ['groups'] },
    );

    if (user == null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist`);
    }

    const groupObj = await this.groupRepository.findOne(
      { id: groupId },
      { populate: ['cameras'] },
    );

    if (groupObj == null) {
      throw new NotFoundError(`Group with ID "${groupId}" does not exist`);
    }

    if (userId != groupObj.user.id) {
      throw new ForbiddenException();
    }

    // ensures that no cameras are in the group.
    if (groupObj.cameras.length != 0) {
      throw new ConflictException(
        `Group "${groupObj.name}" is not empty and still has cameras associated with it on the backend.`,
      );
    }

    user.groups.remove(groupObj);
    await this.usersRepository.flush();

    return true;
  }

  /**
   * Register a camera to the given user and group
   *
   * @param userId the user's ID.
   * @param groupId the group ID.
   * @param cameraDetails the name, serial, and public key of a new camera.
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
   * Removes all notifications associated with Camera idCam.
   * @param idCam
   */
  public async removeNotifications(idCam: string): Promise<boolean> {
    const cam = await this.cameraRepository.findOne(
      { id: idCam },
      {
        populate: [
          'notifications',
          'notifications.camera',
          'notifications.camera.id',
        ],
      },
    );

    if (cam === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }

    cam.notifications.removeAll();
    await this.cameraRepository.flush();

    return true;
  }

  /**
   * Removes a given camera from one of the user's groups.
   * @param idCam
   */
  public async removeCamera(
    idUser: string,
    idGroup: string,
    idCam: string,
  ): Promise<boolean> {
    // add the thing where it checks that the user owns the idCam param.

    const group = await this.groupRepository.findOne(
      { id: idGroup },
      { populate: ['cameras'] },
    );

    const camera = await this.cameraRepository.findOne({ id: idCam });

    if (group === null) {
      throw new NotFoundError(`Camera with given ID does not exist.`);
    }
    // removes notifications before removing the camera.
    if (await this.removeNotifications(idCam)) {
      group.cameras.remove(camera);
      await this.groupRepository.flush();
    } else {
      throw new Error(
        `During the removal of notifications, there was an error and the deletion of the camera will not proceed.`,
      );
    }

    return true;
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
