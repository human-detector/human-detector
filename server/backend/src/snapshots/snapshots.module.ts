import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { Notification } from '../cameras/notification.entity';
import { SnapshotAuthGuard } from './snapshot-auth.guard';
import { Snapshot } from './snapshot.entity';
import { SnapshotsController } from './snapshots.controller';
import { SnapshotsService } from './snapshots.service';

@Module({
  imports: [AuthModule, MikroOrmModule.forFeature([Snapshot, Notification])],
  controllers: [SnapshotsController],
  providers: [SnapshotAuthGuard, SnapshotsService],
})
export class SnapshotsModule {}
