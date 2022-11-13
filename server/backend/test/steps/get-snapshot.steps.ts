import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { SnapshotsModule } from '../../src/snapshots/snapshots.module';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import request from 'supertest';
import * as UUID from 'uuid';
import { Group } from '../../src/groups/group.entity';
import { notificationWithDummySnapshot } from '../helpers/notification';
import { createCameraWithKeyPair } from '../helpers/camera';
import { Snapshot } from '../../src/snapshots/snapshot.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { User } from '../../src/users/user.entity';

const feature = loadFeature('test/features/get-snapshot.feature');
defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let em: EntityManager;
  let userRepository: EntityRepository<User>;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [SnapshotsModule] });

    em = testStack.module.get<EntityManager>(EntityManager);
    userRepository = em.getRepository(User);

    app = await testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.kcContainer.stop();
    await testStack.dbContainer.stop();
  });

  test('Authenticated user requests a snapshot from the backend', ({
    given,
    and,
    when,
    then,
  }) => {
    let userId: string;
    let accessToken: string;
    let snapshot: Snapshot;
    let res: request.Response;

    given('I have authorization', async () => {
      const login = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userId = login.id;
      accessToken = login.tokenSet.access_token;
    });
    and('One of my cameras has an available snapshot', async () => {
      const { camera } = createCameraWithKeyPair('cmaemram', 'cereal');
      const notification = notificationWithDummySnapshot();
      snapshot = notification.snapshot;
      camera.notifications.add(notification);
      const group = new Group('gorawuowa');
      group.cameras.add(camera);
      const user = await userRepository.findOneOrFail({ id: userId });
      group.user = user;

      await em.persistAndFlush(group);
    });
    when('I request a snapshot', async () => {
      res = await request(app.getHttpServer())
        .get(`/snapshots/${snapshot.id}`)
        .auth(accessToken, { type: 'bearer' });
    });
    then('I receive the image data', () => {
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpeg');
      expect(res.body).toBe(snapshot.image);
    });
  });

  test('Authenticated user fetches a non-existent snapshot', ({
    given,
    when,
    then,
  }) => {
    let accessToken: string;
    const snapshotId = UUID.v4();
    let res: request.Response;

    given('I have authorization', async () => {
      const login = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      accessToken = login.tokenSet.access_token;
    });
    when('I request a non-existent snapshot', async () => {
      res = await request(app.getHttpServer())
        .get(`/snapshots/${snapshotId}`)
        .auth(accessToken, { type: 'bearer' });
    });
    then('I receive a "Forbidden" error', () => {
      expect(res.statusCode).toBe(403);
    });
  });

  test('Authenticated user attempting to fetch a snapshot they do not own', ({
    given,
    and,
    when,
    then,
  }) => {
    let accessToken: string;
    let userIdB: string;
    let snapshot: Snapshot;
    let res: request.Response;

    given('I am authorized as user A', async () => {
      accessToken = await testStack.kcContainer
        .createDummyUserAndLogIn('users')
        .then(({ tokenSet }) => tokenSet.access_token);
      userIdB = await testStack.kcContainer
        .createDummyUser('users')
        .then(({ id }) => id);
    });
    and('User B has a snapshot', async () => {
      const { camera } = createCameraWithKeyPair('cmaemram', 'cereal');
      const notification = notificationWithDummySnapshot();
      snapshot = notification.snapshot;
      camera.notifications.add(notification);
      const group = new Group('aaaaaa pain');
      group.cameras.add(camera);
      const user = await userRepository.findOneOrFail({ id: userIdB });
      group.user = user;

      await em.persistAndFlush(group);
    });
    when("I request user B's snapshot as user A", async () => {
      res = await request(app.getHttpServer())
        .get(`/snapshots/${snapshot.id}`)
        .auth(accessToken, { type: 'bearer' });
    });
    then('I receive a "Forbidden" error', () => {
      expect(res.statusCode).toBe(403);
    });
  });

  test('Unauthenticated client attempting to fetch a snapshot', ({
    given,
    and,
    when,
    then,
  }) => {
    let accessToken: string;
    let snapshot: Snapshot;
    let res: request.Response;

    given('I am unauthenticated', () => {
      accessToken = '';
    });
    and('User A has a snapshot', async () => {
      const { camera } = createCameraWithKeyPair('cmaemram', 'cereal');
      const notification = notificationWithDummySnapshot();
      snapshot = notification.snapshot;
      camera.notifications.add(notification);
      const group = new Group('missouri');
      group.cameras.add(camera);
      const user = new User();
      group.user = user;

      await em.persistAndFlush(group);
    });
    when("I request user A's snapshot", async () => {
      res = await request(app.getHttpServer())
        .get(`/snapshots/${snapshot.id}`)
        .set('authorization', accessToken);
    });
    then('I receive an "Unauthenticated" error', () => {
      expect(res.statusCode).toBe(401);
    });
  });
});
