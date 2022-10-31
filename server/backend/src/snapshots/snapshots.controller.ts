import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
} from '@nestjs/common';
import { NotFoundError } from '../errors.types';
import { SnapshotsService } from './snapshots.service';

// TODO: auth, maybe?
@Controller('snapshots')
export class SnapshotsController {
  constructor(
    @Inject()
    private snapshotsService: SnapshotsService,
  ) {}

  @Get(':id')
  async getSnapshot(@Param('id') snapshotId: string) {
    try {
      return this.snapshotsService.getSnapshotImage(snapshotId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      }
      throw error;
    }
  }
}
