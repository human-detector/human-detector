import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as request from 'supertest';
import { Camera } from '../../src/cameras/camera.entity';
import { Notification } from '../../src/cameras/notification.entity';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { CamerasModule } from '../../src/cameras/cameras.module';
import { Group } from '../../src/groups/group.entity';
import { User } from '../../src/users/user.entity';

const feature = loadFeature('test/features/send-notification.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let cameraRepository: EntityRepository<Camera>;
  let em: EntityManager;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [CamerasModule] });

    em = testStack.module.get<MikroORM>(MikroORM).em.fork();
    cameraRepository = em.getRepository(Camera);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.dbContainer.stop();
  });

  test('Sending without credentials', ({ given, when, then, and }) => {
    let cameraA: Camera;
    let sendRes: request.Response;
    let beforeNotifications: Notification[];
    let token: string;

    given('I have no credentials', () => {
      token = '';
    });
    and('Camera A has 3 notifications', async () => {
      cameraA = new Camera('Camera-A', 'TODO');
      cameraA.notifications.add(new Notification());
      cameraA.group = new Group('g');
      cameraA.group.user = new User('test');
      await cameraRepository.persistAndFlush(cameraA);
      beforeNotifications = cameraA.notifications.getItems();
    });
    when('I try to send a notification for camera A', async () => {
      sendRes = await request(app.getHttpServer())
        .put(`/cameras/${cameraA.id}/notifications`)
        .auth(token, { type: 'bearer' });
    });
    then("I receive an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera A has 3 notifications', async () => {
      const res = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .auth(cameraA.token, { type: 'bearer' });
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/^application\/json/);
      expect(res.body).toBe(beforeNotifications);
    });
  });

  test('Sending to an invalid camera ID', ({ given, when, then, and }) => {
    let cameraA: Camera;
    const cameraCId = v4();
    const requestURL = `/cameras/${cameraCId}/notifications`;
    let token: string;
    let sendRes: request.Response;

    given("I have camera A's credentials", async () => {
      cameraA = new Camera('CameraA', 'TODO :)');
      cameraA.group = new Group('e');
      cameraA.group.user = new User('eorwabk');
      await cameraRepository.persistAndFlush(cameraA);
      token = cameraA.token;
    });
    and('Camera C is not registered', async () => {
      await request(app.getHttpServer())
        .get(requestURL)
        .auth(token, { type: 'bearer' })
        .expect(401);
    });
    when("I try to send a notification using camera C's ID", async () => {
      sendRes = await request(app.getHttpServer())
        .put(requestURL)
        .auth(token, { type: 'bearer' });
    });
    then("I recieve an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera C is not registered', async () => {
      await request(app.getHttpServer())
        .get(requestURL)
        .auth(token, { type: 'bearer' })
        .expect(401);
    });
  });

  test("Attempting to send a notification on behalf of camera B using camera A's credentials", ({
    given,
    when,
    then,
    and,
  }) => {
    let cameraA: Camera;
    let cameraB: Camera;
    let token: string;
    let beforeNotifications: Notification[];
    let sendRes: request.Response;

    given("I have camera A's credentials", async () => {
      cameraA = new Camera('Camera-A', 'TODO!! :)');
      cameraA.group = new Group('g');
      cameraA.group.user = new User('test');
      await cameraRepository.persistAndFlush(cameraA);
      token = cameraA.token;
    });
    and('Camera B has 2 notifications', async () => {
      cameraB = new Camera('Camera-B', 'TODO KEYCLOAK AAAAA');
      cameraB.notifications.add(new Notification(), new Notification());
      cameraB.group = new Group('b');
      cameraB.group.user = new User('g');
      await cameraRepository.persistAndFlush(cameraB);
      beforeNotifications = cameraB.notifications.getItems();
    });
    when('I try to send a notification on behalf of camera B', async () => {
      sendRes = await request(app.getHttpServer())
        .put(`/cameras/${cameraB.id}/notifications`)
        .auth(token, { type: 'bearer' });
    });
    then("I recieve an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera B has 2 notifications', async () => {
      const res = await request(app.getHttpServer())
        .get(`/cameras/${cameraB.id}/notifications`)
        .auth(cameraB.token, { type: 'bearer' });
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/^application\/json/);
      expect(res.body).toBe(beforeNotifications);
    });
  });

  test('Sending a notification with valid credentials', ({
    given,
    when,
    then,
    and,
  }) => {
    let cameraA: Camera;
    let token: string;
    let sendRes: request.Response;

    given("I have camera A's credentials", async () => {
      cameraA = new Camera('Camera-A', 'TODO !!!!!!!');
      cameraA.group = new Group('group');
      cameraA.group.user = new User('user');
      await cameraRepository.persistAndFlush(cameraA);
      token = cameraA.token;
    });
    and('Camera A has 1 notification', async () => {
      cameraA.notifications.add(new Notification());
      await cameraRepository.flush();
    });
    when('I try to send a notification on behalf of camera A', async () => {
      sendRes = await request(app.getHttpServer())
        .put(`/cameras/${cameraA.id}/notifications`)
        .auth(token, { type: 'bearer' });
    });
    then('The request succeeded', () => {
      expect(sendRes.status).toBe(200);
    });
    and('Camera A has 2 notifications', async () => {
      const res = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .auth(token, { type: 'bearer' });
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/^application\/json/);
      expect(res.body).toHaveLength(2);
    });
  });
});
