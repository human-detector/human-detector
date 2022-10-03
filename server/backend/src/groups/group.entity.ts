import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { User } from '../users/user.entity';
import { v4 } from 'uuid';
import { Camera } from '../cameras/camera.entity';

@Entity()
export class Group {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property()
  name!: string;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => Camera, (camera) => camera.group)
  cameras = new Collection<Camera>(this);

  constructor(name: string) {
    this.name = name;
  }
}
