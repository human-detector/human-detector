import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { Group } from '../groups/group.entity';
import { v4 } from 'uuid';

@Entity()
export class User {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property()
  name!: string;

  @OneToMany(() => Group, (group) => group.user)
  groups = new Collection<Group>(this);

  constructor(name: string) {
    this.name = name;
  }
}
