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
import { Group } from '../../src/groups/group.entity';
import { User } from '../../src/users/user.entity';
import { IPUSH_NOTIFICATIONS_SERVICE_TOKEN } from '../../src/cameras/push-notifications/push-notifications-service.interface';
import { notificationWithDummySnapshot } from '../helpers/notification';
import { UsersModule } from '../../src/users/users.module';
import { v4 } from 'uuid';

const feature = loadFeature('test/features/delete-camera.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let usersRepository: EntityRepository<User>;
  let em: EntityManager;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [UsersModule] }, (builder) =>
      Promise.resolve(
        builder
          .overrideProvider(IPUSH_NOTIFICATIONS_SERVICE_TOKEN)
          .useValue('bogus'),
      ),
    );

    em = testStack.module.get<MikroORM>(MikroORM).em.fork();
    usersRepository = em.getRepository(User);

    app = await testStack.module.createNestApplication();
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
    let groupA: Group;
    let userA: User;
    let cameraA: Camera;
    let token: string;
    let deleteRes: request.Response;

    given('I have a valid camera ID', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userA = await usersRepository.findOneOrFail(
        { id },
        { populate: ['groups'] },
      );

      token = tokenSet.access_token;
      groupA = new Group('groupA');
      cameraA = new Camera('CameraA', 'defAPubKey', '2046');
      userA.groups.add(groupA);
      groupA.cameras.add(cameraA);
      await usersRepository.flush();
    });
    and('the camera has no notifications associated with it', () => {
      expect(cameraA.notifications.length).toBe(0);
    });
    when('I request to delete the camera', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/users/${userA.id}/groups/${groupA.id}/cameras/${cameraA.id}`)
        .auth(token, { type: 'bearer' });
    });
    then('the camera will be deleted', () => {
      expect(deleteRes.status).toBe(200);
    });
    and('the camera is no longer on the backend', async () => {
      const expectedResponse = [
        {
          id: groupA.id,
          name: groupA.name,
          cameras: [],
        },
      ];
      const groupsReq = await request(app.getHttpServer())
        .get(`/users/${userA.id}/groups`)
        .auth(token, { type: 'bearer' });
      expect(groupsReq.body).toEqual(expectedResponse);
    });
  });

  test('Deleting a camera with 2 notifications', ({
    given,
    and,
    when,
    then,
  }) => {
    let userB: User;
    let groupB: Group;
    let cameraB: Camera;
    let token: string;
    let deleteRes: request.Response;

    given('I have a valid camera ID', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userB = await usersRepository.findOneOrFail(
        { id },
        { populate: ['groups'] },
      );

      token = tokenSet.access_token;
      cameraB = new Camera('Camera B', 'ABCD', '2910');
      groupB = new Group('group B');
      userB.groups.add(groupB);
      groupB.cameras.add(cameraB);
      await usersRepository.flush();
    });
    and('the camera has 2 notifications associated with it', async () => {
      cameraB.notifications.add(notificationWithDummySnapshot());
      cameraB.notifications.add(notificationWithDummySnapshot());
      await usersRepository.flush();
    });
    when('I request to delete the camera', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/users/${userB.id}/groups/${groupB.id}/cameras/${cameraB.id}`)
        .auth(token, { type: 'bearer' });
    });
    then('the camera will be deleted', () => {
      expect(deleteRes.status).toBe(200);
    });
    and('the camera is no longer on the backend', async () => {
      const expectedResponse = [
        {
          id: groupB.id,
          name: groupB.name,
          cameras: [],
        },
      ];
      const groupsReq = await request(app.getHttpServer())
        .get(`/users/${userB.id}/groups`)
        .auth(token, { type: 'bearer' });
      expect(groupsReq.body).toEqual(expectedResponse);
    });
  });

  test('Trying to delete a camera that does not exist', ({
    given,
    when,
    then,
  }) => {
    let res: request.Response;
    let token: string;
    let cameraId: string;
    let userC: User;
    let groupC: Group;

    given('I have an invalid camera ID', async () => {
      const { id: id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userC = await usersRepository.findOneOrFail(
        { id: id },
        { populate: ['groups'] },
      );

      cameraId = v4();
      token = tokenSet.access_token;
      groupC = new Group('group C');
      userC.groups.add(groupC);
      usersRepository.flush();
    });
    when('I request to delete the camera', async () => {
      res = await request(app.getHttpServer())
        .delete(`/users/${userC.id}/groups/${groupC.id}/cameras/${cameraId}`)
        .auth(token, { type: 'bearer' });
    });
    then("a 'Forbidden' error will be received", () => {
      expect(res.status).toBe(403);
    });
  });

  test('Trying to delete a camera that belongs to another user', ({
    given,
    and,
    when,
    then,
  }) => {
    let userD: User;
    let token: string;
    let userE: User;
    let groupE: Group;
    let cameraE: Camera;
    let res: request.Response;

    given('I am a registered user', async () => {
      const { id: id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userD = await usersRepository.findOneOrFail({ id: id });
      token = tokenSet.access_token;
    });
    and('there is another user with a registered camera', async () => {
      const { id: id } = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userE = await usersRepository.findOneOrFail(
        { id: id },
        { populate: ['groups'] },
      );
      groupE = new Group('groupE');
      cameraE = new Camera('CameraE', 'publicKeyE', '2077');
      userE.groups.add(groupE);
      groupE.cameras.add(cameraE);
      await usersRepository.flush();
    });
    when('I request to delete the camera of another user', async () => {
      res = await request(app.getHttpServer())
        .delete(`/users/${userD.id}/groups/${groupE.id}/cameras/${cameraE.id}`)
        .auth(token, { type: 'bearer' });
    });
    then('I will receive a Forbidden error', () => {
      expect(res.status).toEqual(403);
    });
  });
});
