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
import * as request from 'supertest';
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
      await testStack.dbContainer.stop();
      await app.close();
    }, TEST_STACK_TIMEOUT);

    test('Updating after login', ({ given, and, when, then }) => {
      let expoToken: string;
      let user: User;
      let response: request.Response;

      given('I have a new Expo push token', () => {
        expoToken = 'push-token';
      });
      and('I am logged in', async () => {
        user = new User('tester');
        await userRepository.persistAndFlush(user);
      });
      when('I try to update my push token', async () => {
        // TODO: auth
        response = await request(app.getHttpServer())
          .put(`/users/${user.id}/notifyToken`)
          .send({ expoToken });
      });
      then('It succeeds', () => {
        expect(response.statusCode).toBe(200);
      });
      and('My push token has been updated', async () => {
        user = await userRepository.findOne({ id: user.id });
        expect(user.expoToken).toBe(expoToken);
      });
    });

    test('Updating without credentials', ({ given, and, when, then }) => {
      let expoToken: string;
      let user: User;
      let response: request.Response;

      given('I have a new Expo push token', () => {
        expoToken = 'another-push-token';
      });
      and('I am not logged in', async () => {
        user = new User('doofus');
        await userRepository.persistAndFlush(user);
      });
      when('I try to update my push token', async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${user.id}/notifyToken`)
          .send({ expoToken });
      });
      then('It fails with an unauthorized error', () => {
        expect(response.statusCode).toBe(403);
      });
      and('My push token has not been updated', async () => {
        user = await userRepository.findOne({ id: user.id });
        expect(user.expoToken).toBeUndefined();
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
      let response: request.Response;

      given('I have a new Expo push token', () => {
        expoToken = 'yet-another-push-token';
      });
      and('I have a bogus user ID', () => {
        userId = v4();
      });
      when('I try to update their push token', async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${userId}/notifyToken`)
          .send({ expoToken });
      });
      then('It fails with an unauthorized error', () => {
        expect(response.statusCode).toBe(403);
      });
    });
  },
);
