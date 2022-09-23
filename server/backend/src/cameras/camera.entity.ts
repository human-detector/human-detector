import { v4 } from 'uuid';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Camera {
  constructor(name: string, token: string) {
    this.name = name;
    this.token = token;
  }

  @PrimaryKey()
  id = v4();

  @Property()
  name!: string;

  @Property()
  token!: string;
}
