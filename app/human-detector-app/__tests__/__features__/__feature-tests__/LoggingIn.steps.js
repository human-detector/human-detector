// logging-in.steps.js

import { loadFeature, defineFeature } from 'jest-cucumber';
import { authenticateLogin, isValidUsername, isValidPassword } from '../../../user/User';
import User from '../../../user/User';

const feature = loadFeature('__tests__/__features__/LoggingIn.feature');

defineFeature(feature, (test) => {

	let user;

  test('Entering correct username and password', ({ given, when, and, then }) => {
    given('I have an account', () => {
		//in the server
    });

    when('I enter my username correctly', () => {
		expect(isValidUsername('testUserInput')).toBe(true)
    });

    and('enter my password correctly', () => {
		expect(isValidPassword('testUserInput')).toBe(true)
    });


    then('I should be authorized to have access to the application', () => {
		expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(true)
    });

    test('Entering incorrect username but correct password', ({ given, when, and, then }) => {
    	given('I have an account', () => {
			//in the server
    	});

    	when('I enter my username incorrectly', () => {
			expect(isValidUsername('testUserInput')).toBe(false)
    	});

    	and('enter my password correctly', () => {
			expect(isValidPassword('testUserInput')).toBe(true)
    	});

    	then('I should not have authorized access to the application', () => {
			expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(false)
    	});
    });

    test('Entering incorrect username and password', ({ given, when, and, then }) => {
    	given('I have an account', () => {
			//in the server
    	});

    	when('I enter my username incorrectly', () => {
			expect(isValidUsername('testUserInput')).toBe(false)
    	});

    	and('enter my password incorrectly', () => {
			expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(false)
    	});

    	then('I should not have authorized access to the application', () => {
			expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(false)
    	});
    });

	test('Entering incorrect username', ({ given, when, then }) => {
    	given('I have an account', () => {
			//in the server
    	});

    	when('I enter my username incorrectly', () => {
			expect(isValidUsername('testUserInput')).toBe(false)
    	});

    	then('I should not have authorized access to the application', () => {
			expect(authenticateLogin("testUserInput", "testUserInput", "testServerInput")).toBe(false)
    	});
    });






  });
});