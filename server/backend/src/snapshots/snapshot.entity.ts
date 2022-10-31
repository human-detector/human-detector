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

  // Base64-encoded image data
  @Property()
  image: string;

  @OneToOne(() => Notification)
  notification: Notification;

  constructor(image: string) {
    this.image = image;
  }
}
