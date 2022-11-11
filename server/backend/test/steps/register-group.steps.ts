import { defineFeature, loadFeature } from 'jest-cucumber';
import { INestApplication } from '@nestjs/common';
import { v4 } from 'uuid';
import request from 'supertest';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import {
  buildTestStack,
  TestStack,
  TEST_STACK_TIMEOUT,
} from '../helpers/test-stack';
import { UsersModule } from '../../src/users/users.module';
import { User } from '../../src/users/user.entity';
import { Group } from '../../src/groups/group.entity';
import { Camera } from '../../src/cameras/camera.entity';

defineFeature(loadFeature('test/features/register-group.feature'), (test) => {
  let app: INestApplication;
  let testStack: TestStack;
  let usersRepository: EntityRepository<User>;
  let groupRepository: EntityRepository<Group>;
  let cameraRepository: EntityRepository<Camera>;

  beforeAll(async () => {
    testStack = await buildTestStack({ imports: [UsersModule] });
    usersRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(User);

    groupRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(Group);

    cameraRepository = testStack.module
      .get<MikroORM>(MikroORM)
      .em.getRepository(Camera);

    app = testStack.module.createNestApplication();
    await app.init();
  }, TEST_STACK_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await testStack.kcContainer.stop();
    await testStack.dbContainer.stop();
  });

  test('User is registering a group from the app', ({
    given,
    when,
    then,
    and,
  }) => {
    let group: Group;
    let user: User;
    let token: string;
    let response: request.Response;
    let groupId: string;

    given('I have credentials', async () => {
      const { id, tokenSet } =
        await testStack.kcContainer.createDummyUserAndLogIn('users');
      user = await usersRepository.findOneOrFail({ id });
      group = new Group('Group-A');
      user.groups.add(group);
      await usersRepository.flush();
      token = tokenSet.access_token;
    });
    when('I register a group through the app', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${user.id}/group`)
        .send({
          name: 'New-Group',
        })
        .auth(token, { type: 'bearer' });
    });
    then('I receive the group ID', async () => {
      expect(response.statusCode).toBe(200);
      expect(response.type).toEqual('application/json');
      expect(response.body.id).toBeDefined();

      groupId = response.body.id;
      expect(
        await groupRepository.findOneOrFail({ id: groupId }),
      ).toBeInstanceOf(Group);
    });
    console.log(user);

    and('The group is registered', async () => {
      expect(user.groups).toHaveLength(2);
    });
  });

  test('User A is attempting to register a group to User B', ({
    given,
    when,
    then,
  }) => {
    let userB: User;
    let userTokenA: string;
    let response: request.Response;
    given("I have user A's credentials", async () => {
      const userBLogin = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userB = await usersRepository.findOneOrFail({ id: userBLogin.id });
      const userALogin = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userTokenA = userALogin.tokenSet.access_token;
      await usersRepository.flush();
    });

    when('I register the group to user B', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${userB.id}/group`)
        .send({ name: 'New-Group-A' })
        .auth(userTokenA, { type: 'bearer' });
    });

    then('I receive an unauthorized error', () => {
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchSnapshot();
    });
  });

  test('User A is attempting to register a group to a non-existant User B', ({
    given,
    when,
    then,
  }) => {
    const userIdB = v4();
    let userTokenA: string;
    let response: request.Response;

    given("I have user A's credentials", async () => {
      const { tokenSet } = await testStack.kcContainer.createDummyUserAndLogIn(
        'users',
      );
      userTokenA = tokenSet.access_token;
    });

    when('I register the group to user B', async () => {
      response = await request(app.getHttpServer())
        .put(`/users/${userIdB}/group`)
        .send({ name: 'New-Group-A' })
        .auth(userTokenA, { type: 'bearer' });
    });

    then('I receive an unauthorized error', () => {
      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchSnapshot();
    });
  });
});
