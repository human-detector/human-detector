import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import request from 'supertest';
import { v4 } from 'uuid';

defineFeature(
  loadFeature('test/features/update-push-token.feature'),
  (test) => {
    let app: INestApplication;
    let testStack: TestStack;
    let userRepository: EntityRepository<User>;

    beforeAll(async () => {
      testStack = await buildTestStack({ imports: [UsersModule] });

      userRepository = testStack.module
        .get<MikroORM>(MikroORM)
        .em.getRepository(User);

      app = await testStack.module.createNestApplication();
      await app.init();
    }, TEST_STACK_TIMEOUT);

    afterAll(async () => {
      await app.close();
      await testStack.kcContainer.stop();
      await testStack.dbContainer.stop();
    }, TEST_STACK_TIMEOUT);

    test('Updating after login', ({ given, and, when, then }) => {
      let expoToken: string;
      let userId: string;
      let userAccessToken: string;
      let response: request.Response;

      given('I have a new Expo push token', () => {
        expoToken = 'push-token';
      });
      and('I am logged in', async () => {
        const { id, tokenSet } =
          await testStack.kcContainer.createDummyUserAndLogIn('users');
        userId = id;
        userAccessToken = tokenSet.access_token;
      });
      when('I try to update my push token', async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${userId}/notifyToken`)
          .auth(userAccessToken, { type: 'bearer' })
          .send({ expoToken });
      });
      then('It succeeds', () => {
        expect(response.statusCode).toBe(200);
      });
      and('My push token has been updated', async () => {
        const user = await userRepository.findOne({ id: userId });
        expect(user.expoToken).toBe(expoToken);
      });
    });

    test('Updating without credentials', ({ given, and, when, then }) => {
      let expoToken: string;
      let userId: string;
      let response: request.Response;

      given('I have a new Expo push token', () => {
        expoToken = 'another-push-token';
      });
      and('I am not logged in', async () => {
        const { id } = await testStack.kcContainer.createDummyUser('users');
        userId = id;
      });
      when('I try to update my push token', async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${userId}/notifyToken`)
          .send({ expoToken });
      });
      then('It fails with an unauthorized error', () => {
        expect(response.statusCode).toBe(401);
      });
      and('My push token has not been updated', async () => {
        const user = await userRepository.findOne({ id: userId });
        expect(user.expoToken).toBeNull();
      });
    });

    test("Updating a non-existent user's token", ({
      given,
      and,
      when,
      then,
    }) => {
      let expoToken: string;
      let userId: string;
      let otherUserAccessToken: string;
      let response: request.Response;

      given('I have a new Expo push token', () => {
        expoToken = 'yet-another-push-token';
      });
      and('I have a bogus user ID', async () => {
        userId = v4();
        const { tokenSet } =
          await testStack.kcContainer.createDummyUserAndLogIn('users');
        otherUserAccessToken = tokenSet.access_token;
      });
      when('I try to update their push token', async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${userId}/notifyToken`)
          .auth(otherUserAccessToken, { type: 'bearer' })
          .send({ expoToken });
      });
      then('It fails with a forbidden error', () => {
        expect(response.statusCode).toBe(403);
      });
    });
  },
);
