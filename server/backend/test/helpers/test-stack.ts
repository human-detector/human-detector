import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import mikroOrmOptions from '../../mikro-orm.config';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from 'testcontainers';
import { MikroORM } from '@mikro-orm/core';
import { ModuleMetadata } from '@nestjs/common';

export interface TestStack {
  module: TestingModule;
  dbContainer: StartedPostgreSqlContainer;
}

/**
 * Timeout for the 'beforeAll()' hook in Jest tests. Docker containers take some time to spin up,
 * even more so if it needs to pull the image during setup.
 */
export const TEST_STACK_TIMEOUT = 30000;

/**
 * Builds a test instance of our Nest application with our dependencies (e.g. Postgres)
 * running in Docker containers.
 */
export async function buildTestStack(
  moduleMetadata: ModuleMetadata,
): Promise<TestStack> {
  const dbContainer = await new PostgreSqlContainer(
    'postgres:14-alpine',
  ).start();

  const testModule = await Test.createTestingModule({
    ...moduleMetadata,
    imports: [
      ...moduleMetadata.imports,
      MikroOrmModule.forRoot({
        ...mikroOrmOptions,
        host: 'localhost',
        dbName: dbContainer.getDatabase(),
        user: dbContainer.getUsername(),
        password: dbContainer.getPassword(),
        port: dbContainer.getPort(),
        allowGlobalContext: true,
      }),
    ],
  }).compile();

  const orm = testModule.get<MikroORM>(MikroORM);
  await orm.getSchemaGenerator().createSchema();

  return { module: testModule, dbContainer };
}
