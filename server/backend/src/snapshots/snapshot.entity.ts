import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Notification } from '../cameras/notification.entity';

@Entity()
export class Snapshot {
  @PrimaryKey({ type: UuidType })
  id = v4();

  // Binary image data
  @Property()
  image: Buffer;

  @OneToOne(() => Notification)
  notification: Notification;

  constructor(image: Buffer) {
    this.image = image;
  }
}
