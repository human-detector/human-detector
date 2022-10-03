import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { v4 } from 'uuid';
import * as request from 'supertest';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { User } from '../../src/users/user.entity';
import { Group } from '../../src/groups/group.entity';
import { Camera } from '../../src/cameras/camera.entity';
import { GetGroupsOutput } from '../../src/users/users.controller';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { UsersModule } from '../../src/users/users.module';

defineFeature(
  loadFeature('test/features/list-camera-groups.feature'),
  (test) => {
    let app: INestApplication;
    let testStack: TestStack;
    let userRepository: EntityRepository<User>;

    beforeAll(async () => {
      testStack = await buildTestStack({ imports: [UsersModule] });
      userRepository = testStack.module
        .get<MikroORM>(MikroORM)
        .em.getRepository(User);

      app = testStack.module.createNestApplication();
      await app.init();
    }, TEST_STACK_TIMEOUT);

    afterAll(async () => {
      await app.close();
      await testStack.dbContainer.stop();
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

      given("I have user A's credentials", async () => {
        userB = new User('user-b');
        await userRepository.persistAndFlush(userB);
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
