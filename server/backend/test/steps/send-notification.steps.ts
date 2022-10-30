import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import request from 'supertest';
import { Camera } from '../../src/cameras/camera.entity';
import { Notification } from '../../src/cameras/notification.entity';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { EntityDTO, EntityManager, EntityRepository } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { CamerasModule } from '../../src/cameras/cameras.module';
import { Group } from '../../src/groups/group.entity';
import { User } from '../../src/users/user.entity';
import { createCameraWithKeyPair, getCameraAuthToken } from '../helpers/camera';
import {
  IPushNotificationsService,
  IPUSH_NOTIFICATIONS_SERVICE_TOKEN,
} from '../../src/cameras/push-notifications/push-notifications-service.interface';

const feature = loadFeature('test/features/send-notification.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let cameraRepository: EntityRepository<Camera>;
  let mockPushNotificationsService: jest.Mocked<IPushNotificationsService>;
  let em: EntityManager;

  beforeAll(async () => {
    mockPushNotificationsService = {
      sendPushNotification: jest.fn(),
    };
    testStack = await buildTestStack({ imports: [CamerasModule] }, (builder) =>
      Promise.resolve(
        builder
          .overrideProvider(IPUSH_NOTIFICATIONS_SERVICE_TOKEN)
          .useValue(mockPushNotificationsService),
      ),
    );

    em = testStack.module.get<EntityManager>(EntityManager);
    cameraRepository = em.getRepository(Camera);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.kcContainer.stop();
    await testStack.dbContainer.stop();
  });

  test('Sending without credentials', ({ given, when, then, and }) => {
    let cameraA: Camera;
    let sendRes: request.Response;
    let beforeNotifications: EntityDTO<Notification>[];
    let token: string;

    given('I have no credentials', () => {
      token = '';
    });
    and('Camera A has 3 notifications', async () => {
      const { camera } = createCameraWithKeyPair('Camera A', 'Serial A');
      cameraA = camera;
      cameraA.notifications.add(
        new Notification(),
        new Notification(),
        new Notification(),
      );
      cameraA.group = new Group('g');
      cameraA.group.user = new User();
      cameraA.group.user.expoToken = 'ExponentPushToken[000000000000]';
      await cameraRepository.persistAndFlush(cameraA);
      beforeNotifications = cameraA.notifications.toArray();
    });
    when('I try to send a notification for camera A', async () => {
      sendRes = await request(app.getHttpServer()).put(
        `/cameras/${cameraA.id}/notifications`,
      );
    });
    then("I receive an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera A has 3 notifications', async () => {
      expect(cameraA.notifications.toArray().length).toEqual(
        beforeNotifications.length,
      );
    });
  });

  test('Sending to an invalid camera ID', ({ given, when, then, and }) => {
    let cameraA: Camera;
    const cameraCId = v4();
    const requestURL = `/cameras/${cameraCId}/notifications`;
    let token: string;
    let sendRes: request.Response;

    given("I have camera A's credentials", async () => {
      const { camera, keyPair } = createCameraWithKeyPair('CameraA', 'SerialA');
      cameraA = camera;
      cameraA.group = new Group('e');
      cameraA.group.user = new User();
      cameraA.group.user.expoToken = 'ExponentPushToken[000000000000]';
      await cameraRepository.persistAndFlush(cameraA);
      token = getCameraAuthToken(camera, keyPair.privateKey);
    });
    and('Camera C is not registered', () => {
      expect(cameraRepository.findOne({ id: cameraCId })).resolves.toBeNull();
    });
    when("I try to send a notification using camera C's ID", async () => {
      sendRes = await request(app.getHttpServer())
        .put(requestURL)
        .set('Authorization', token);
    });
    then("I recieve a 'Forbidden' error", () => {
      expect(sendRes.status).toBe(403);
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
    let beforeNotifications: EntityDTO<Notification>[];
    let sendRes: request.Response;

    given("I have camera A's credentials", async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'Serial-A',
      );
      cameraA = camera;
      cameraA.group = new Group('g');
      cameraA.group.user = new User();
      cameraA.group.user.expoToken = 'ExponentPushToken[000000000000]';
      await cameraRepository.persistAndFlush(cameraA);
      token = getCameraAuthToken(camera, keyPair.privateKey);
    });
    and('Camera B has 2 notifications', async () => {
      const { camera } = createCameraWithKeyPair('Camera-B', 'Serial-B');
      cameraB = camera;
      cameraB.notifications.add(new Notification(), new Notification());
      cameraB.group = new Group('b');
      cameraB.group.user = new User();
      await cameraRepository.persistAndFlush(cameraB);
      beforeNotifications = cameraB.notifications.toArray();
    });
    when('I try to send a notification on behalf of camera B', async () => {
      sendRes = await request(app.getHttpServer())
        .put(`/cameras/${cameraB.id}/notifications`)
        .set('Authorization', token);
    });
    then("I recieve a 'Forbidden' error", () => {
      expect(sendRes.status).toBe(403);
    });
    and('Camera B has 2 notifications', async () => {
      expect(cameraB.notifications.toArray().length).toEqual(
        beforeNotifications.length,
      );
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
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'Serial-A',
      );
      cameraA = camera;
      cameraA.group = new Group('group');
      cameraA.group.user = new User();
      cameraA.group.user.expoToken = 'ExponentPushToken[000000000000]';
      await cameraRepository.persistAndFlush(cameraA);
      token = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    and('Camera A has 0 notifications', async () => {
      const resBefore = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', token);
      expect(resBefore.status).toBe(200);
      expect(resBefore.body).toHaveLength(0);
    });
    when('I try to send a notification on behalf of camera A', async () => {
      sendRes = await request(app.getHttpServer())
        .put(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', token);
    });
    then('The request succeeded', () => {
      expect(sendRes.status).toBe(200);
    });
    and('Camera A has 1 notification', async () => {
      const resAfter = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', token);
      expect(resAfter.status).toBe(200);
      expect(resAfter.body).toHaveLength(1);
    });
  });
});
