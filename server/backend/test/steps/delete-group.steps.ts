import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import request from 'supertest';
import { Camera } from '../../src/cameras/camera.entity';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { UsersModule } from '../../src/users/users.module';
import { Group } from '../../src/groups/group.entity';
import { User } from '../../src/users/user.entity';

const feature = loadFeature('test/features/delete-group.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let groupRepository: EntityRepository<Group>;
  let usersRepository: EntityRepository<User>;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [UsersModule] });
    usersRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(User);

    groupRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(Group);
    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.dbContainer.stop();
    await testStack.kcContainer.stop();
  });

  test('Deleting a group with 1 camera in it', ({ given, and, when, then }) => {
    let cameraA: Camera;
    let userA: User;
    let groupA: Group;
    let groupAv2: Group;
    let token: string;
    let deleteRes: request.Response;

    given('I have a valid group ID and 1 camera attached to it', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userA = await usersRepository.findOneOrFail(
        { id },
        { populate: ['groups'] },
      );
      token = tokenSet.access_token;
      groupA = new Group('Group-A');
      cameraA = new Camera('My camera :)', 'Wat', 'serial-number: 2');

      userA.groups.add(groupA);
      groupA.cameras.add(cameraA);

      await usersRepository.flush();
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/users/${userA.id}/groups/${groupA.id}`)
        .auth(token, { type: 'bearer' });
    });
    then('I will receive a Not Found Error', () => {
      expect(deleteRes.status).toBe(409);
    });
    and('the group will still be active', async () => {
      groupAv2 = await groupRepository.findOne({ id: groupA.id });
      expect(groupAv2).toBe(groupA);
    });
  });

  test('Deleting a group with no cameras in it', ({
    given,
    and,
    when,
    then,
  }) => {
    let groupB: Group;
    let userB: User;
    let token: string;
    let deleteRes: request.Response;
    let getRes: request.Response;

    given('I have a valid group ID', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userB = await usersRepository.findOneOrFail(
        { id },
        { populate: ['groups'] },
      );

      token = tokenSet.access_token;
      groupB = new Group('Group-B');
      userB.groups.add(groupB);
      await usersRepository.flush();
    });
    and('the group has no cameras associated with it', () => {
      expect(groupB.cameras.length).toBe(0);
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .del(`/users/${userB.id}/groups/${groupB.id}`)
        .auth(token, { type: 'bearer' });
    });
    then('the group will be deleted', async () => {
      expect(deleteRes.status).toBe(200);
      getRes = await request(app.getHttpServer())
        .get(`/users/${userB.id}/groups/${groupB.id}`)
        .auth(token, { type: 'bearer' });
      expect(getRes.status).toBe(404);
    });
  });

  test('Deleting a group with an invalid group ID', ({ given, when, then }) => {
    let deleteRes: request.Response;
    let token: string;
    let userC: User;
    let groupId: string;

    given('I have an invalid group ID', async () => {
      groupId = '';
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      userC = await usersRepository.findOneOrFail(
        { id },
        { populate: ['groups'] },
      );

      token = tokenSet.access_token;
      await usersRepository.flush();
    });
    when('I request to delete the group', async () => {
      deleteRes = await request(app.getHttpServer())
        .delete(`/users/${userC.id}/groups/${groupId}`)
        .auth(token, { type: 'bearer' });
    });
    then('I will receive a Not Found Error', () => {
      expect(deleteRes.status).toBe(404);
    });
  });
});
