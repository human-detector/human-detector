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

  // A user might not have a push notification:
  // - After account registration
  // - If they never allow notification permissions in the app
  @Property({ nullable: true })
  expoToken?: string;

  @OneToMany(() => Group, (group) => group.user)
  groups = new Collection<Group>(this);
}
