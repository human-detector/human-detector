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
   * Fetch a snapshot image, returning the image encoded in base64.
   * @param id snapshot ID
   */
  public async getSnapshotImage(id: string): Promise<string> {
    const snapshot = await this.snapshotRepository
      .findOneOrFail({ id })
      .catch(() => {
        throw new NotFoundError(`Snapshot with ID ${id} not found.`);
      });
    return snapshot.image;
  }
}
