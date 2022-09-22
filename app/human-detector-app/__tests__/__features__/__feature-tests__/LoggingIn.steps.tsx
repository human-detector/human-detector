
import { loadFeature, defineFeature } from 'jest-cucumber';
import { authenticateLogin, isValidUsername, isValidPassword } from '../../../classes/User';
import User from '../../../classes/User';

const nock = require('nock')

const feature = loadFeature('__tests__/__features__/LoggingIn.feature');

defineFeature(feature, (test) => {
	let user;

  test('Entering correct username and password', ({ given, when, and, then }) => {

	let mockServer;

    given('I have an account', () => {
		mockServer = nock('http://eyespy.tkw')
			.get('/auth/login')
			.reply(200, 'testUserInput')
    });

    when('I enter my username correctly', () => {
		expect(isValidUsername('testUserInput')).toBe(true)
    });

    and('enter my password correctly', () => {
		mockServer = nock('http://eyespy.tkw')
			.get('/auth/login')
			.reply(200, 'testUserInputPass')
		expect(isValidPassword('testUserInputPass')).toBe(true)
    });


    then('I should be authorized to have access to the application', () => {
		expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(true)
    });

    test('Entering incorrect username but correct password', ({ given, when, and, then }) => {
    	given('I have an account', () => {
			mockServer = nock('http://eyespy.tkw')
				.get('/auth/login')
				.reply(200, 'testUserInputPass')
    	});

    	when('I enter my username incorrectly', () => {
			expect(isValidUsername('testUserInput')).toBe(false)
    	});

    	and('enter my password correctly', () => {
			mockServer = nock('http://eyespy.tkw')
				.get('/auth/login')
				.reply(200, 'testUserInputPass')
			expect(isValidPassword('testUserInputPass')).toBe(true)
    	});

    	then('I should not have authorized access to the application', () => {
			expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(false)
    	});
    });

    test('Entering incorrect username and password', ({ given, when, and, then }) => {
    	given('I have an account', () => {
		mockServer = nock('http://eyespy.tkw')
			.get('/auth/login')
			.reply(200, 'testUserInput')
    	});

    	when('I enter my username incorrectly', () => {
			expect(isValidUsername('testUserInput')).toBe(false)
    	});

    	and('enter my password incorrectly', () => {
			mockServer = nock('http://eyespy.tkw')
				.get('/auth/login')
				.reply(200, 'testUserInputPass')
			expect(isValidPassword('testUserInputPass')).toBe(false)
    	});

    	then('I should not have authorized access to the application', () => {
			expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(false)
    	});
    });

	test('Entering incorrect username', ({ given, when, then }) => {
    	given('I have an account', () => {
			mockServer = nock('http://eyespy.tkw')
				.get('/auth/login')
				.reply(200, 'testUserInputPass')
			expect(isValidPassword('testUserInput')).toBe(false)
    	});

    	when('I enter my username incorrectly', () => {
			expect(isValidUsername('testUserInput')).toBe(false)
    	});

    	then('I should not have authorized access to the application', () => {
			expect(authenticateLogin("testUserInput", "testUserInputPass", "testServerInput")).toBe(false)
    	});
    });

  });
});