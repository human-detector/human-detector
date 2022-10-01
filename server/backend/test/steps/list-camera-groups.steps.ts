import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { v4 } from 'uuid';
import * as request from 'supertest';
import { UsersModule } from '../../src/users/users.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from 'testcontainers';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import options from '../../mikro-orm.config';
import * as path from 'path';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { User } from '../../src/users/user.entity';
import { Group } from '../../src/groups/group.entity';
import { Camera } from '../../src/cameras/camera.entity';
import { GetGroupsOutput } from '../../src/users/users.controller';

jest.setTimeout(30000);

defineFeature(
  loadFeature('test/features/list-camera-groups.feature'),
  (test) => {
    let app: INestApplication;
    let dbContainer: StartedPostgreSqlContainer;
    let userRepository: EntityRepository<User>;

    beforeAll(async () => {
      dbContainer = await new PostgreSqlContainer('postgres:14-alpine')
        .withBindMount(
          path.resolve('../../dist'),
          '/docker-entrypoint-initdb.d',
        )
        .start();
      const moduleRef = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            ...options,
            host: 'localhost',
            dbName: dbContainer.getDatabase(),
            user: dbContainer.getUsername(),
            password: dbContainer.getPassword(),
            port: dbContainer.getPort(),
            allowGlobalContext: true,
          }),
          UsersModule,
        ],
      }).compile();

      const orm = moduleRef.get<MikroORM>(MikroORM);
      await orm.getSchemaGenerator().createSchema();
      userRepository = orm.em.getRepository(User);

      app = moduleRef.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await app.close();
      await dbContainer.stop();
    });

    test('User is viewing their camera groups from the app', ({
      given,
      when,
      then,
    }) => {
      let user: User;
      let token: string;
      let response: request.Response;

      given('I have credentials', async () => {
        user = new User('test-user');
        user.groups.add(new Group('group-a'));
        user.groups[0].cameras.add(new Camera('My camera :)', 'wajebawk'));
        await userRepository.persistAndFlush(user);
        token = 'bogus'; // FIXME: test with well-formed tokens once we get auth set up
      });
      when('I request a list of my camera groups', async () => {
        response = await request(app.getHttpServer())
          .get(`/users/${user.id}/groups`)
          .auth(token, { type: 'bearer' });
      });
      then(
        'I receive my camera groups, including the list of cameras associated with each group',
        () => {
          const expectedResponse: GetGroupsOutput = [
            {
              id: user.groups[0].id,
              name: user.groups[0].name,
              cameras: [
                {
                  id: user.groups[0].cameras[0].id,
                  name: user.groups[0].cameras[0].name,
                },
              ],
            },
          ];
          expect(response.statusCode).toBe(200);
          expect(response.type).toEqual('application/json');
          expect(response.body).toEqual(expectedResponse);
        },
      );
    });

    test("User A is attempting to list another user B's camera groups", ({
      given,
      when,
      then,
    }) => {
      let userB: User;
      let userTokenA: string;
      let response: request.Response;

      given("I have user A's credentials", () => {
        userB = new User('user-b');
        userRepository.persistAndFlush(userB);
        userTokenA = 'wogus'; // FIXME: test with well-formed tokens
      });
      when("I request user B's camera groups", async () => {
        response = await request(app.getHttpServer())
          .get(`/users/${userB.id}/groups`)
          .auth(userTokenA, { type: 'bearer' });
      });
      then('I receive an unauthorized error', () => {
        expect(response.statusCode).toBe(403);
        expect(response.body).toMatchSnapshot();
      });
    });

    test('User A is attempting to list the camera groups of user B, a non-existent user', ({
      given,
      when,
      then,
    }) => {
      const userIdB = v4();
      let userTokenA: string;
      let response: request.Response;

      given("I have user A's credentials", () => {
        userTokenA = 'zogus'; // FIXME: test with well-formed tokens
      });
      when("I request user B's camera groups", async () => {
        response = await request(app.getHttpServer())
          .get(`/users/${userIdB}/groups`)
          .auth(userTokenA, { type: 'bearer' });
      });
      then('I receive an unauthorized error', () => {
        expect(response.statusCode).toBe(403);
        expect(response.body).toMatchSnapshot();
      });
    });

    test('User is attempting to view their camera groups with an expired token', ({
      given,
      when,
      then,
    }) => {
      const userId = v4();
      let token: string;
      let response: request.Response;

      given("I have user A's expired credentials", () => {
        token = 'amogus'; // FIXME: test with well-formed tokens
      });
      when("I request user A's camera groups", async () => {
        response = await request(app.getHttpServer())
          .get(`/users/${userId}/groups`)
          .auth(token, { type: 'bearer' });
      });
      then('I receive an unauthenticated error', () => {
        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchSnapshot();
      });
    });
  },
);
