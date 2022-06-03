// logging-in.steps.js

import { loadFeature, defineFeature } from 'jest-cucumber';

const feature = loadFeature('__tests__/__features__/LoggingIn.feature');

defineFeature(feature, (test) => {

  test('Entering correct username and password', ({ given, when, and, then }) => {
    given('I have an account', () => {

    });

    when('I enter my username correctly', () => {

    });

    and('enter my password correctly', () => {

    });


    then('I should be authorized to have access to the application', () => {

    });

    test('Entering incorrect username but correct password', ({ given, when, and, then }) => {
    	given('I have an account', () => {

    	});

    	when('I enter my username incorrectly', () => {

    	});

    	and('enter my password correctly', () => {

    	});

    	then('I should not have authorized access to the application', () => {

    	});
    });

    test('Entering incorrect username and password', ({ given, when, and, then }) => {
    	given('I have an account', () => {

    	});

    	when('I enter my username incorrectly', () => {

    	});

    	and('enter my password incorrectly', () => {

    	});

    	then('I should not have authorized access to the application', () => {

    	});
    });





  });
});