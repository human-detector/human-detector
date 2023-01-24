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

const feature = loadFeature('test/features/delete-group.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let groupRepository: EntityRepository<Group>;
  let usersRepository: EntityRepository<User>;
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
    groupRepository = em.getRepository(Group);

    usersRepository = em.getRepository(User);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);
  //jest.setTimeout(25000);
  afterAll(async () => {
    await app.close();
    await testStack.dbContainer.stop();
    await testStack.kcContainer.stop();
  });

  test('Deleting a group with no cameras in it', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupA: Group;
    let userA: User;
    let deleteRes: request.Response;
    let token: string;
    let groupId: string;
    let userId: string;

    given('I have a valid group ID', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('UserA');
      userA = await usersRepository.findOneOrFail(
        { id },
        { populate: ['groups'] },
      );

      groupA = new Group('Group-A');
      userA.groups.add(groupA);
      await usersRepository.flush();
      token = tokenSet.access_token;
    });
    and('the group has no cameras associated with it', () => {
      expect(groupA.cameras.length).toBe(0);
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/groups/${groupA.id}`)
        .auth(token, { type: 'bearer' });
    });
    then('the group will be deleted', async () => {
      expect(deleteRes.status).toBe(200);
    });
  });

  test('Deleting a group with 1 camera in it', ({ given, and, when, then }) => {
    let cameraA: Camera;
    let token: string;
    let deleteRes: request.Response;
    let getRes: request.Response;

    given('I have a valid group ID and 1 camera attached to it', async () => {
      const { camera, keyPair } = createCameraWithKeyPair(
        'Camera-A',
        'test-test',
      );
      cameraA = camera;
      cameraA.group = new Group('the-group');
      cameraA.group.user = new User();
      await groupRepository.persistAndFlush(cameraA.group);
      token = getCameraAuthToken(cameraA, keyPair.privateKey);
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/groups/${cameraA.group.id}`)
        .set('Authorization', token);
    });
    then('I will receive a Not Found Error', () => {
      expect(deleteRes.status).toBe(404);
    });
    and('the group will still be active', async () => {
      getRes = await request(app.getHttpServer())
        .get(`/groups/${cameraA.group.id}`)
        .set('Authorization', token);
      expect(getRes.status).toBe(200);
    });
  });

  test('Deleting a group with an invalid group ID', ({ given, when, then }) => {
    let deleteRes: request.Response;
    let groupId: string;

    given('I have an invalid group ID', () => {
      groupId = 'not-real-id';
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer()).delete(
        `/groups/${groupId}`,
      );
    });
    then('I will receive a Not Found Error', () => {
      expect(deleteRes.status).toBe(404);
    });
  });
});
