import { v4 } from 'uuid';
import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { Camera } from '../cameras/camera.entity';
import { TimestampType } from '../util';

@Entity()
export class Notification {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property({ type: TimestampType })
  timestamp = Date();

  @ManyToOne(() => Camera, { hidden: true })
  camera!: Camera;
}
