import { v4 } from 'uuid';
import { PrimaryKey, Property } from '@mikro-orm/core'

export class Notification {
  @PrimaryKey()
  id = v4();

  @Property()
  timestamp = new Date();
}
