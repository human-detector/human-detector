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

const feature = loadFeature('test/features/get-notifications.feature');

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
	
	test('Using a valid ID with 2 notifications to get', ({ given, and, when, then }) => {
		let cameraA: Camera;
		let getRes: request.Response;
		let notifications: Notification[];
		let token: string;
		
		given('I have a valid ID', async () => {
			cameraA = new Camera('CameraA', 'test-token1');
			cameraA.group = new Group('test-group1');
			cameraA.group.user = new User('test-user1');
			await cameraRepository.persistAndFlush(cameraA);
			token = cameraA.token;
		});
		and('the ID has 2 notifications associated with it', async () => {
			cameraA.notifications.add(new Notification());
			cameraA.notifications.add(new Notification());
			await cameraRepository.flush();
		});
		when('I request to get the notifications', async () => {
			getRes = await request(app.getHttpServer())
				.get(`/cameras/${cameraA.id}/notifications`)
				.auth(token, { type: 'bearer' });
		});
		then('the request will go through', async () => {
			expect(getRes.status).toBe(200);
		});
		and('I will receive a Notification array of 2', async () => {
			const res = await request(app.getHttpServer())
				.get(`/cameras/${cameraA.id}/notifications`)
				.auth(token, { type: 'bearer' });
				expect(res.status).toBe(200);
				expect(res.header['content-type']).toMatch(/^application\/json/);
				expect(res.body).toHaveLength(2);
		});
	});
	
	test('Using a valid ID with 0 notifications to get', ({ given, and, when, then }) => {
		let cameraA: Camera;
		let getRes: request.Response;
		let notifications: Notification[];
		let token: string;
		
		given('I have a valid ID', async () => {
			cameraA = new Camera('CameraA', 'test-token2');
			cameraA.group = new Group('test-group2');
			cameraA.group.user = new User('test-user2');
			await cameraRepository.persistAndFlush(cameraA);
			token = cameraA.token;
		});
		and('the ID has 0 notifications associated with it', async () => {
			
		});
		when('I request to get the notifications', async () => {
			getRes = await request(app.getHttpServer())
				.get(`/cameras/${cameraA.id}/notifications`)
				.auth(token, { type: 'bearer' });
		});
		then('the request will go through', async () => {
			expect(getRes.status).toBe(200);
		});
		and('I will receive a Notification array of 0', async () => {
			const res = await request(app.getHttpServer())
				.get(`/cameras/${cameraA.id}/notifications`)
				.auth(token, { type: 'bearer' });
				expect(res.status).toBe(200);
				expect(res.header['content-type']).toMatch(/^application\/json/);
				expect(res.body).toHaveLength(0);
		});
	});
	
	test('Using an ID I do not have access to with 1 notification to get', ({ given, and, when, then }) => {
		let cameraA: Camera;
		const cameraBId = v4();
		const requestURL = `/cameras/${cameraBId}/notifications`;
		let getRes: request.Response;
		let token: string;
		
		given("I have camera A's details", async () => {
			cameraA = new Camera('CameraA', 'test-token3');
			cameraA.group = new Group('test-group3');
			cameraA.group.user = new User('test-user3');
			await cameraRepository.persistAndFlush(cameraA);
			token = cameraA.token;
		});
		and('camera A has 1 notification', async () => {
			cameraA.notifications.add(new Notification());
			await cameraRepository.flush();
		});
		and('camera B is not registered', async () => {
			await request(app.getHttpServer())
				.get(requestURL)
				.auth(token, { type: 'bearer' })
				.expect(401);
		});
		when("I request to get the notifications from camera A with camera B's ID", async () => {
			getRes = await request(app.getHttpServer())
				.get(requestURL)
				.auth(token, { type: 'bearer' });
		});
		then("the request will receive an 'Unauthorized' error", async () => {
			expect(getRes.status).toBe(401);
		});
	});
	
	test('Trying to get notifications without any credentials', ({ given, and, when, then }) => {
		let cameraA: Camera;
		let getRes: request.Response;
		let beforeNotification: Notification[];
		let token: string;
		
		given('I have no credentials', async () => {
			token = '';
		});
		and('camera A has 1 notification attributed to it', async () => {
			cameraA = new Camera('CameraA', 'test-token4');
			cameraA.notifications.add(new Notification());
			cameraA.group = new Group('test-group4');
			cameraA.group.user = new User('test-user4');
			await cameraRepository.persistAndFlush(cameraA);
			beforeNotification = cameraA.notifications.getItems();
		});
		when('I try to get the notification from camera A', async () => {
			getRes = await request(app.getHttpServer())
				.get(`/cameras/${cameraA.id}/notifications`)
				.auth(token, { type: 'bearer' });
		});
		then("I will receive an 'Unauthorized' error", async () => {
			expect(getRes.status).toBe(401);
		});
		and('Camera A will have the same notification as before', async () => {
			const res = await request(app.getHttpServer())
				.get(`/cameras/${cameraA.id}/notifications`)
				.auth(cameraA.token, { type: 'bearer' });
			expect(res.status).toBe(200);
			expect(res.body).toBe(beforeNotification);
		});
	});	
});
