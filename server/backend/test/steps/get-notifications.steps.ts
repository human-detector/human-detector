import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import request from 'supertest';
import { Camera } from '../../src/cameras/camera.entity';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import { CamerasModule } from '../../src/cameras/cameras.module';
import { Group } from '../../src/groups/group.entity';
import { User } from '../../src/users/user.entity';
import { createCameraWithKeyPair, getCameraAuthToken } from '../helpers/camera';
import { GetNotificationsOutput } from 'src/cameras/cameras.controller';
import { IPUSH_NOTIFICATIONS_SERVICE_TOKEN } from '../../src/cameras/push-notifications/push-notifications-service.interface';
import { notificationWithDummySnapshot } from '../helpers/notification';

const feature = loadFeature('test/features/get-notifications.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let cameraRepository: EntityRepository<Camera>;
  let em: EntityManager;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [CamerasModule] }, (builder) =>
      Promise.resolve(
        builder
          .overrideProvider(IPUSH_NOTIFICATIONS_SERVICE_TOKEN)
          .useValue('bogus'),
      ),
    );

    em = testStack.module.get<MikroORM>(MikroORM).em.fork();
    cameraRepository = em.getRepository(Camera);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.dbContainer.stop();
    await testStack.kcContainer.stop();
  });

  test('Using a valid ID with 2 notifications to get', ({
    given,
    and,
    when,
    then,
  }) => {
    let cameraA: Camera;
    let getRes: request.Response;
    let token: string;

    given('I have a valid ID', async () => {
      const { camera, keyPair } = createCameraWithKeyPair('Camera-A', 'cereal');
      cameraA = camera;
      cameraA.group = new Group('group');
      cameraA.group.user = new User();
      await cameraRepository.persistAndFlush(cameraA);
      token = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    and('the ID has 2 notifications associated with it', async () => {
      cameraA.notifications.add(notificationWithDummySnapshot());
      cameraA.notifications.add(notificationWithDummySnapshot());
      await cameraRepository.flush();
    });
    when('I request to get the notifications', async () => {
      getRes = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', token);
    });
    then('the request will go through', () => {
      expect(getRes.status).toBe(200);
    });
    and('I will receive a Notification array of 2', async () => {
      const expectedResponse: GetNotificationsOutput = [
        {
          id: cameraA.notifications[0].id,
          timestamp: new Date(cameraA.notifications[0].timestamp).toISOString(),
          camera: cameraA.notifications[0].camera.id,
        },
        {
          id: cameraA.notifications[1].id,
          timestamp: new Date(cameraA.notifications[1].timestamp).toISOString(),
          camera: cameraA.notifications[1].camera.id,
        },
      ];
      expect(getRes.header['content-type']).toMatch(/^application\/json/);
      expect(getRes.body).toEqual(expectedResponse);
    });
  });

  test('Using an ID I do not have access to with 1 notification to get', ({
    given,
    and,
    when,
    then,
  }) => {
    let cameraA: Camera;
    let cameraB: Camera;
    let getRes: request.Response;
    let tokenA: string;
    let tokenB: string;

    given("I have camera A's details", async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'captain crunch',
      );
      cameraA = camera;
      cameraA.group = new Group('GroopA');
      cameraA.group.user = new User();
      await cameraRepository.persistAndFlush(cameraA);
      tokenA = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    and('camera A has 1 notification', async () => {
      cameraA.notifications.add(notificationWithDummySnapshot());
      await cameraRepository.flush();
    });
    and('camera B is registered', async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-B',
        'cheerios',
      );
      cameraB = camera;
      cameraB.group = new Group('GroopB');
      cameraB.group.user = new User();
      await cameraRepository.persistAndFlush(cameraB);
      tokenB = getCameraAuthToken(cameraB, keyPair.privateKey);
    });
    when(
      "I request to get the notifications from camera A with camera B's token",
      async () => {
        getRes = await request(app.getHttpServer())
          .get(`/cameras/${cameraA.id}/notifications`)
          .set('Authorization', tokenB);
      },
    );
    then("the request will receive a 'Forbidden' error", () => {
      expect(getRes.status).toBe(403);
    });
    and('camera A will still have 1 notification', async () => {
      const expectedResponse: GetNotificationsOutput = [
        {
          id: cameraA.notifications[0].id,
          timestamp: new Date(cameraA.notifications[0].timestamp).toISOString(),
          camera: cameraA.notifications[0].camera.id,
        },
      ];
      const getResActual = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', tokenA);
      expect(getRes.header['content-type']).toMatch(/^application\/json/);
      expect(getResActual.body).toEqual(expectedResponse);
    });
  });

  test('Trying to get notifications from a camera with 1 notification without any credentials', ({
    given,
    and,
    when,
    then,
  }) => {
    let cameraA: Camera;
    let getRes: request.Response;
    let fakeToken: string;
    let tokenA: string;

    given('I have no credentials', () => {
      fakeToken = '';
    });
    and('camera A has 1 notification attributed to it', async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'count chocula',
      );
      cameraA = camera;
      cameraA.group = new Group('g');
      cameraA.group.user = new User();
      cameraA.notifications.add(notificationWithDummySnapshot());
      await cameraRepository.persistAndFlush(cameraA);
      tokenA = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    when('I try to get the notification from camera A', async () => {
      getRes = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', fakeToken);
    });
    then("I will receive a 'Forbidden' error", () => {
      expect(getRes.status).toBe(403);
    });
    and('Camera A will have the same notification as before', async () => {
      const expectedResponse: GetNotificationsOutput = [
        {
          id: cameraA.notifications[0].id,
          timestamp: new Date(cameraA.notifications[0].timestamp).toISOString(),
          camera: cameraA.notifications[0].camera.id,
        },
      ];
      const getResActual = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', tokenA);
      expect(getRes.header['content-type']).toMatch(/^application\/json/);
      expect(getResActual.body).toEqual(expectedResponse);
    });
  });

  test('Trying to get notifications from a camera that is not registered', ({
    given,
    when,
    then,
  }) => {
    let res: request.Response;
    let token: string;
    let id: string;

    given('I have no registered credentials', () => {
      token = '';
      id = 'test-id';
    });
    when(
      'I try to get notifications from a camera that is not registered',
      async () => {
        res = await request(app.getHttpServer())
          .get(`/cameras/${id}/notifications`)
          .set('Authorization', token);
      },
    );
    then("I will receive a 'Forbidden' error", () => {
      expect(res.status).toBe(403);
    });
  });
});
