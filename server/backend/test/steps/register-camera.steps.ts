import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { v4 } from 'uuid';
import request from 'supertest';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { User } from '../../src/users/user.entity';
import { Group } from '../../src/groups/group.entity';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { UsersModule } from '../../src/users/users.module';
import { Camera } from '../../src/cameras/camera.entity';

defineFeature(loadFeature('test/features/register-camera.feature'), (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let userRepository: EntityRepository<User>;
  let groupRepository: EntityRepository<Group>;
  let cameraRepository: EntityRepository<Camera>;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [UsersModule] });
    userRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(User);

    groupRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(Group);

    cameraRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(Camera);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.kcContainer.stop();
    await testStack.dbContainer.stop();
  });

  test('User is registering their camera from the app', ({
    given,
    when,
    then,
    and,
  }) => {
    let group: Group;
    let user: User;
    let token: string;
    let response: request.Response;
    let cameraId: string;

    given('I have credentials', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      user = await userRepository.findOneOrFail({ id });
      group = new Group('Group-A');
      user.groups.add(group);
      await userRepository.flush();
      token = tokenSet.access_token!;
    });
    when('I register the camera through the app', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${user.id}/groups/${group.id}/cameras`)
        .send({
          name: 'Camera-B',
          publicKey: 'Key-B',
          serial: 'Serial-B',
        })
        .auth(token, { type: 'bearer' });
    });
    then('I receive the camera ID', async () => {
      expect(response.statusCode).toBe(200);
      expect(response.type).toEqual('application/json');
      expect(response.body.id).toBeDefined();

      // Camera must be grabbed.
      // Otherwise, the newGroup.cameras collection does not have it!?!?
      const cameraId = response.body.id;
      expect(
        await cameraRepository.findOneOrFail({ id: cameraId }),
      ).toBeInstanceOf(Camera);
    });
    and('The camera is registered', async () => {
      expect(group.cameras).toHaveLength(1);
    });
  });

  test('User A is attempting to register a camera to User B', ({
    given,
    when,
    then,
  }) => {
    const groupId = v4();
    let userB: User;
    let userTokenA: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const userBLogin = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userB = await userRepository.findOneOrFail({ id: userBLogin.id });
      const userALogin = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userTokenA = userALogin.tokenSet.access_token!;
      await userRepository.flush();
    });
    when('I register the camera to user B', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${userB.id}/groups/${groupId}/cameras`)
        .send({
          name: 'Camera-A',
          publicKey: 'Key-A',
          serial: 'Serial-A',
        })
        .auth(userTokenA, { type: 'bearer' });
    });
    then('I receive an unauthorized error', () => {
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchSnapshot();
    });
  });

  test('User A is attempting to register a camera to a non-existant User B', ({
    given,
    when,
    then,
  }) => {
    const groupId = v4();
    const userIdB = v4();
    let userTokenA: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const { tokenSet } = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userTokenA = tokenSet.access_token!;
    });
    when('I register the camera to user B', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${userIdB}/groups/${groupId}/cameras`)
        .send({
          name: 'Camera-A',
          publicKey: 'Key-A',
          serial: 'Serial-A',
        })
        .auth(userTokenA, { type: 'bearer' });
    });
    then('I receive an unauthorized error', () => {
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchSnapshot();
    });
  });

  test('User is attempting to register a camera to a non-existant Group', ({
    given,
    when,
    then,
  }) => {
    const groupId = v4();
    let user: User;
    let token: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      user = await userRepository.findOneOrFail({ id });
      token = tokenSet.access_token!;
    });
    when(
      'I register the camera through the app with a non-existant Group',
      async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${user.id}/groups/${groupId}/cameras`)
          .send({
            name: 'Camera-A',
            publicKey: 'Key-A',
            serial: 'Serial-A',
          })
          .auth(token, { type: 'bearer' });
      },
    );
    then('I receive an unauthorized error', () => {
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchSnapshot();
    });
  });

  test('User is attempting to register a camera with no serial', ({
    given,
    when,
    then,
  }) => {
    let user: User;
    let group: Group;
    let token: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      user = await userRepository.findOneOrFail({ id });
      group = new Group('Group-A');
      user.groups.add(group);
      await userRepository.flush();
      token = tokenSet.access_token!;
    });
    when('I register the camera through the app with no serial', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${user.id}/groups/${group.id}/cameras`)
        .send({
          name: 'Camera-A',
          publicKey: 'Definitely a key',
        })
        .auth(token, { type: 'bearer' });
    });
    then('I receive a bad request error', () => {
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });

  test('User is attempting to register a camera with no name', ({
    given,
    when,
    then,
  }) => {
    let user: User;
    let group: Group;
    let token: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      user = await userRepository.findOneOrFail({ id });
      group = new Group('Group-A');
      user.groups.add(group);
      await userRepository.flush();
      token = tokenSet.access_token!;
    });
    when('I register the camera through the app with no name', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${user.id}/groups/${group.id}/cameras`)
        .send({
          publicKey: 'Definitely a key',
          serial: 'Definitely a serial',
        })
        .auth(token, { type: 'bearer' });
    });
    then('I receive a bad request error', () => {
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });

  test('User is attempting to register a camera with no public key', ({
    given,
    when,
    then,
  }) => {
    let user: User;
    let group: Group;
    let token: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      user = await userRepository.findOneOrFail({ id });
      group = new Group('Group-A');
      user.groups.add(group);
      await userRepository.flush();
      token = tokenSet.access_token!;
    });
    when(
      'I register the camera through the app with no public key',
      async () => {
        response = await request(app.getHttpServer())
          .put(`/users/${user.id}/groups/${group.id}/cameras`)
          .send({
            name: 'Camera-A',
            serial: 'Definitely a serial',
          })
          .auth(token, { type: 'bearer' });
      },
    );
    then('I receive a bad request error', () => {
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });
});
