import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import request from 'supertest';
import { Camera } from '../../src/cameras/camera.entity';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core';
import { CamerasModule } from '../../src/cameras/cameras.module';
import { Group } from '../../src/groups/group.entity';
import { User } from '../../src/users/user.entity';
import { IPUSH_NOTIFICATIONS_SERVICE_TOKEN } from '../../src/cameras/push-notifications/push-notifications-service.interface';
import { createCameraWithKeyPair, getCameraAuthToken } from '../helpers/camera';
import { notificationWithDummySnapshot } from '../helpers/notification';

const feature = loadFeature('test/features/delete-camera.feature');

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

  test('Deleting a camera with 0 notifications', ({
    given,
    and,
    when,
    then,
  }) => {
    let cameraA: Camera;
    let token: string;
    let deleteRes: request.Response;
    let getRes: request.Response;

    given('I have a valid camera ID', async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'totally-legit',
      );
      cameraA = camera;
      cameraA.group = new Group('group');
      cameraA.group.user = new User();
      await cameraRepository.persistAndFlush(cameraA);
      token = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    and('the camera has no notifications associated with it', () => {
      expect(cameraA.notifications.length).toBe(0);
    });
    when('I request to delete the camera', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/cameras/${cameraA.id}`)
        .set('Authorization', token);
    });
    then('the camera will be deleted', () => {
      expect(deleteRes.status).toBe(200);
    });
    and('the camera is no longer on the backend', async () => {
      getRes = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}`)
        .set('Authorization', token);
      expect(getRes.status).toBe(404);
    });
  });

  test('Deleting a camera with 2 notifications', ({
    given,
    and,
    when,
    then,
  }) => {
    let cameraA: Camera;
    let token: string;
    let deleteRes: request.Response;
    let getCamRes: request.Response;
    let getNotifRes: request.Response;

    given('I have a valid camera ID', async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'totally-legit',
      );
      cameraA = camera;
      cameraA.group = new Group('group');
      cameraA.group.user = new User();
      await cameraRepository.persistAndFlush(cameraA);
      token = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    and('the camera has 2 notifications associated with it', async () => {
      cameraA.notifications.add(notificationWithDummySnapshot());
      cameraA.notifications.add(notificationWithDummySnapshot());
      await cameraRepository.flush();
    });
    when('I request to delete the camera', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/cameras/${cameraA.id}`)
        .set('Authorization', token);
    });
    then('the camera will be deleted', () => {
      expect(deleteRes.status).toBe(200);
    });
    and('the notifications will also be deleted', async () => {
      getNotifRes = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}/notifications`)
        .set('Authorization', token);
      expect(getNotifRes.status).toBe(403);
    });
    and('the camera is no longer on the backend', async () => {
      getCamRes = await request(app.getHttpServer())
        .get(`/cameras/${cameraA.id}`)
        .set('Authorization', token);
      expect(getCamRes.status).toBe(404);
    });
  });

  test('Trying to delete a camera that does not exist', ({
    given,
    when,
    then,
  }) => {
    let res: request.Response;
    let token: string;
    let id: string;

    given('I have an invalid camera ID', () => {
      token = '';
      id = 'fake-id';
    });
    when('I request to delete the camera', async () => {
      res = await request(app.getHttpServer())
        .delete(`/cameras/${id}`)
        .set('Authorization', token);
    });
    then("a 'Forbidden' error will be received", () => {
      expect(res.status).toBe(403);
    });
  });
});
