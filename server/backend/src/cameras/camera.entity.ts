import { v4 } from 'uuid';
import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { Group } from '../groups/group.entity';

@Entity()
export class Camera {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property()
  name!: string;

  @Property()
  token!: string;

  constructor(name: string, token: string) {
    this.name = name;
    this.token = token;
  }
}
