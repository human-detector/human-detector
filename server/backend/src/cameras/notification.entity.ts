import { v4 } from 'uuid';
import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { Camera } from '../cameras/camera.entity';
import { TimestampType } from '../util';
import { Snapshot } from '../snapshots/snapshot.entity';

@Entity()
export class Notification {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property({ type: TimestampType })
  timestamp = Date();

  @ManyToOne(() => Camera)
  camera!: Camera;

  @OneToOne()
  snapshot: Snapshot;

  constructor(snapshot: Snapshot) {
    this.snapshot = snapshot;
  }
}
