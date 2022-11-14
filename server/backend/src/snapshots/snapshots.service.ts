import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../errors.types';
import { Snapshot } from './snapshot.entity';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: EntityRepository<Snapshot>,
  ) {}

  /**
   * Fetch a snapshot's image.
   * @param id snapshot ID
   */
  public async getSnapshotImage(id: string): Promise<Buffer> {
    const snapshot = await this.snapshotRepository
      .findOneOrFail({ id })
      .catch(() => {
        throw new NotFoundError(`Snapshot with ID ${id} not found.`);
      });
    return snapshot.image;
  }

  /**
   * Fetch the ID of the user who owns this snapshot. A user owns a snapshot if
   * they are the owner of the camera that this snapshot came from.
   * @param snapshotId
   */
  public async getSnapshotOwnerId(snapshotId: string): Promise<string> {
    const snapshot = await this.snapshotRepository
      .findOneOrFail(
        { id: snapshotId },
        { populate: ['notification.camera.group.user.id'] },
      )
      .catch(() => {
        throw new NotFoundError(`Snapshot with ID ${snapshotId} not found.`);
      });
    return snapshot.notification.camera.group.user.id;
  }
}
