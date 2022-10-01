import { v4 } from 'uuid';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Notification {
  @PrimaryKey()
  id = v4();

  @Property()
  timestamp = new Date();
}
