import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { bufferMimeTypes } from '../cameras/image-buffer';
import { NotFoundError } from '../errors.types';
import { SnapshotAuthGuard } from './snapshot-auth.guard';
import { SnapshotsService } from './snapshots.service';

@Controller('snapshots')
@UseGuards(SnapshotAuthGuard)
export class SnapshotsController {
  constructor(private snapshotsService: SnapshotsService) {}

  @Get(':id')
  public async getSnapshot(
    @Param('id') snapshotId: string,
  ): Promise<StreamableFile> {
    try {
      const image = await this.snapshotsService.getSnapshotImage(snapshotId);
      return new StreamableFile(image, { type: bufferMimeTypes(image)[0] });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      }
      throw error;
    }
  }
}
