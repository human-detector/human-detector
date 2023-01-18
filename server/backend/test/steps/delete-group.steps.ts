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
import { createCameraWithKeyPair } from '../helpers/camera';



const feature = loadFeature('test/features/delete-group.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let groupRepository: EntityRepository<Group>;
  let em: EntityManager;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [CamerasModule] }, (builder) => 
      Promise.resolve(
        builder.overrideProvider(IPUSH_NOTIFICATIONS_SERVICE_TOKEN).useValue('bogus'),
      ),
    );

    em = testStack.module.get<MikroORM>(MikroORM).em.fork();
    groupRepository = em.getRepository(Group);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.dbContainer.stop();
    await testStack.kcContainer.stop();
  })

  test('Deleting a group with no cameras in it', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupA: Group;
    let deleteRes: request.Response;

    given('I have a valid group ID', async () => {
      groupA = new Group("group");
      await groupRepository.persistAndFlush(groupA);
    });
    and('the group has no cameras associated with it', () => {
      expect(groupA.cameras.length).toBe(0);
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/groups/${groupA.id}`);
    });
    then('the group will be deleted', async () => {
      expect(deleteRes.status).toBe(200);
    })
  })

  test('Deleting a group with 1 camera in it', ({
    given,
    and,
    when,
    then,
  }) => {
    let cameraA: Camera;
    let deleteRes: request.Response;
    let getRes: request.Response;

    given('I have a valid group ID and 1 camera attached to it', async () => {
      const { camera } = createCameraWithKeyPair('Camera-A', 'test-test');
      cameraA = camera;
      cameraA.group = new Group('the-group');
      cameraA.group.user = new User();
      await groupRepository.persistAndFlush(cameraA.group);
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/groups/${cameraA.group.id}`);
    });
    then('I will receive an error', () => {
      expect(deleteRes.status).toBe(400);
    });
    and('the group will still be active', async () => {
      getRes = await request(app.getHttpServer())
        .get(`/groups/${cameraA.group.id}`);

      expect(getRes.status).toBe(200);
    });
  });

  test('Deleting a group with an invalid group ID', ({
    given,
    when,
    then,
  }) => {
    let deleteRes: request.Response;
    let groupId: string;

    given('I have an invalid group ID', () => {
      groupId = "not-real-id";
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/groups/${groupId}`);
    });
    then('I will receive an error', () => {
      expect(deleteRes.status).toBe(400);
    });
  });
});