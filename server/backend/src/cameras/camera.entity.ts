import { v4 } from 'uuid';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { Group } from '../groups/group.entity';
import { Notification } from './notification.entity';

@Entity()
export class Camera {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property()
  name!: string;

  // PEM-encoded public key
  @Property()
  publicKey!: string;

  @Property()
  serial!: string;

  @ManyToOne(() => Group)
  group: Group;

  @OneToMany(() => Notification, (notification) => notification.camera, {
    orphanRemoval: true,
  })
  notifications = new Collection<Notification>(this);

  constructor(name: string, publicKey: string, serial: string) {
    this.name = name;
    this.publicKey = publicKey;
    this.serial = serial;
  }
}
