import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { NotFoundError } from '../errors.types';
import { SnapshotAuthGuard } from './snapshot-auth.guard';
import { SnapshotsService } from './snapshots.service';
import { Response } from 'express';

@Controller('snapshots')
@UseGuards(SnapshotAuthGuard)
export class SnapshotsController {
  constructor(private snapshotsService: SnapshotsService) {}

  @Get(':id')
  public async getSnapshot(
    @Param('id') snapshotId: string,
    @Res() res: Response,
  ): Promise<StreamableFile> {
    try {
      const image = await this.snapshotsService.getSnapshotImage(snapshotId);
      res.set('Content-Type', 'image/jpeg');
      return new StreamableFile(image);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenException();
      }
      throw error;
    }
  }
}
