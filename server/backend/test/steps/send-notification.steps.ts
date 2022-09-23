import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as request from 'supertest';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { CamerasModule } from '../../src/cameras/cameras.module';
import { Camera } from '../../src/cameras/camera.entity';
import { Notification } from '../../src/cameras/notification.entity';

const feature = loadFeature('test/features/send-notification.feature');
const cameraA = new Camera('Cam-A', 'camera-A-token');
const cameraB = new Camera('Cam-B', 'camera-B-token');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let notificationRepository;

  beforeAll(async () => {
    /* FIXME: typescript. just define the MockNotificationRepository properly, extend the EntityRepository class */
    notificationRepository = {
      notifications: [],
      persist: (notification: Notification) => {
        return;
      },
      findByCameraID(id: string): Notification[] {
        return [];
      },
    };
    const moduleRef = await Test.createTestingModule({
      imports: [CamerasModule],
    })
      .overrideProvider(getRepositoryToken(Notification))
      .useValue(notificationRepository)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Sending without credentials', ({ given, when, then, and }) => {
    const requestURL = `/cameras/${cameraA.id}/notifications`;
    let sendRes: request.Response;
    let beforeNotifications: Notification[];
    let token: string;

    given('I have no credentials', () => {
      token = '';
    });
    and('Camera A has 3 notifications', () => {
      notificationRepository.notifications = [
        new Notification(),
        new Notification(),
        new Notification(),
      ];
      beforeNotifications = [...notificationRepository.notifications];
    });
    when('I try to send a notification for camera A', async () => {
      sendRes = await request(app.getHttpServer())
        .put(requestURL)
        .auth(token, { type: 'bearer' });
    });
    then("I receive an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera A has 3 notifications', async () => {
      const res = await request(app.getHttpServer())
        .get(requestURL)
        .auth(cameraA.token, { type: 'bearer' });
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/^application\/json/);
      expect(res.body).toBe(beforeNotifications);
    });
  });

  test('Sending to an invalid camera ID', ({ given, when, then, and }) => {
    const cameraCID = '6f9f4780-b688-4a9a-9eba-c07c0439e74f';
    const requestURL = `/cameras/${cameraCID}/notifications`;
    let token: string;
    let sendRes: request.Response;

    given("I have camera A's credentials", () => {
      token = cameraA.token;
    });
    and('Camera C is not registered', () => {
      /* TODO */
    });
    when("I try to send a notification using camera C's ID", async () => {
      sendRes = await request(app.getHttpServer())
        .put(requestURL)
        .auth(token, { type: 'bearer' });
    });
    then("I recieve an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera C is not registered', () => {
      /* TODO */
    });
  });

  test("Attempting to send a notification on behalf of camera B using camera A's credentials", ({
    given,
    when,
    then,
    and,
  }) => {
    const requestURL = `/cameras/${cameraB.id}/notifications`;
    let token: string;
    let beforeNotifications: Notification[];
    let sendRes: request.Response;

    given("I have camera A's credentials", () => {
      token = cameraA.token;
    });
    and('Camera B has 2 notifications', () => {
      notificationRepository.notifications = [
        new Notification(),
        new Notification(),
      ];
      beforeNotifications = [...notificationRepository.notifications];
    });
    when('I try to send a notification on behalf of camera B', async () => {
      sendRes = await request(app.getHttpServer())
        .put(requestURL)
        .auth(token, { type: 'bearer' });
    });
    then("I recieve an 'Unauthorized' error", () => {
      expect(sendRes.status).toBe(401);
    });
    and('Camera B has 2 notifications', async () => {
      const res = await request(app.getHttpServer())
        .get(requestURL)
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
    const requestURL = `/cameras/${cameraA.id}/notifications`;
    let token: string;
    let sendRes: request.Response;

    given("I have camera A's credentials", () => {
      token = cameraA.token;
    });
    and('Camera A has 1 notification', () => {
      notificationRepository.notifications = [new Notification()];
    });
    when('I try to send a notification on behalf of camera A', async () => {
      sendRes = await request(app.getHttpServer())
        .put(requestURL)
        .auth(token, { type: 'bearer' });
    });
    then('The request succeeded', () => {
      expect(sendRes.status).toBe(200);
    });
    and('Camera A has 2 notifications', async () => {
      const res = await request(app.getHttpServer())
        .get(requestURL)
        .auth(token, { type: 'bearer' });
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/^application\/json/);
      expect(res.body).toHaveLength(2);
    });
  });
});
