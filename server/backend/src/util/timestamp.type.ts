import { DateTimeType, Platform } from '@mikro-orm/core';

/**
 * Represents an ISO8601 timestamp. MikroORM doesn't serialize Javascript Date objects as ISO8601
 * by default, so a custom type is necessary.
 */
export class TimestampType extends DateTimeType {
  convertToDatabaseValue(
    value: string | Date,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    platform: Platform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromQuery?: boolean,
  ): string {
    if (!(value instanceof Date)) {
      value = new Date(value);
    }

    return value.toISOString();
  }
}
