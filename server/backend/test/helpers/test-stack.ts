import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import mikroOrmOptions from '../../mikro-orm.config';
import {
  Network,
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from 'testcontainers';
import { MikroORM } from '@mikro-orm/core';
import { ModuleMetadata } from '@nestjs/common';
import path from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { v4 } from 'uuid';
import {
  KeycloakContainer,
  StartedKeycloakContainer,
} from './keycloak-container';

export interface TestStack {
  module: TestingModule;
  dbContainer: StartedPostgreSqlContainer;
  kcContainer: StartedKeycloakContainer;
}

/**
 * Timeout for the 'beforeAll()' hook in Jest tests. Docker containers take some time to spin up,
 * even more so if it needs to pull the image during setup.
 */
export const TEST_STACK_TIMEOUT = 60000;

/**
 * Builds a test instance of our Nest application with our dependencies (e.g. Postgres)
 * running in Docker containers.
 */
export async function buildTestStack(
  moduleMetadata: ModuleMetadata,
  beforeCompile?: (
    builder: TestingModuleBuilder,
  ) => Promise<TestingModuleBuilder>,
): Promise<TestStack> {
  // FIXME: this assumes the tests are running in 'server/backend/' to life easier
  const dockerComposeFileDir = path.resolve(process.cwd(), '..');
  if (
    !existsSync(dockerComposeFileDir) ||
    !existsSync(path.resolve(dockerComposeFileDir, 'docker-compose.yaml'))
  ) {
    throw new Error(
      'Could not find Docker Compose file. Are you running tests in the backend directory?',
    );
  }
  const devEnvFilePath = path.resolve(dockerComposeFileDir, 'dev.env');
  if (!existsSync(devEnvFilePath)) {
    throw new Error(
      'Could not find dev environment file. Are you running tests in the backend directory?',
    );
  }
  const devEnvParseResult = dotenv.config({ path: devEnvFilePath });
  if (devEnvParseResult.error) {
    throw new Error(`Failed to parse env file at "${devEnvFilePath}"`);
  }

  const network = await new Network({ name: `test-stack-${v4()}` }).start();
  const dbContainer = await new PostgreSqlContainer('postgres:14-alpine')
    .withExposedPorts(5432)
    .withNetworkMode(network.getName())
    .withNetworkAliases('db')
    .start();

  const kcContainer = await new KeycloakContainer('server-keycloak:latest')
    .withNetworkMode(network.getName())
    .withEnv('SYNC_USERS_DB_HOST', 'db')
    .withEnv('SYNC_USERS_DB_NAME', dbContainer.getDatabase())
    .withEnv('SYNC_USERS_DB_USER', dbContainer.getUsername())
    .withEnv('SYNC_USERS_DB_PASSWORD', dbContainer.getPassword())
    .start();

  let testModuleBuilder = await Test.createTestingModule({
    ...moduleMetadata,
    imports: [
      ...moduleMetadata.imports,
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            keycloak: {
              host: `localhost:${kcContainer.getPort()}`,
            },
          }),
        ],
      }),
      MikroOrmModule.forRoot({
        ...mikroOrmOptions,
        // Our modules only load entities that they manage repositories for, so most modules will
        // be missing some entities if we use autoloading.
        autoLoadEntities: false,
        entities: ['./src/**/*.entity.ts'],
        dbName: dbContainer.getDatabase(),
        user: dbContainer.getUsername(),
        password: dbContainer.getPassword(),
        host: 'localhost',
        port: dbContainer.getMappedPort(5432),
        allowGlobalContext: true,
      }),
    ],
  });

  if (beforeCompile) {
    testModuleBuilder = await beforeCompile(testModuleBuilder);
  }

  const testModule = await testModuleBuilder.compile();

  const orm = testModule.get<MikroORM>(MikroORM);
  await orm.getSchemaGenerator().createSchema();

  return { module: testModule, dbContainer, kcContainer };
}
