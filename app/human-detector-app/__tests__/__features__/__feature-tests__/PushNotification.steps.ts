import { loadFeature, defineFeature } from 'jest-cucumber';
import User, { getUserNotifPerm, isSnoozeOn} from '../../../classes/User';
import { apiLink } from '../../../config/ServerConfig';

const nock = require('nock')

const feature = loadFeature('__tests__/__features__/PushNotification.feature');

defineFeature(feature, (test) => {

    test('Camera senses a detection', ({ given, when, and, then }) => {
        let user: User;

    	given('I am not home', () => {
            user = new User("usernameTest", "43789826743", true)
    	});

    	when('my camera senses a detection', () => {
            // tested on camera
    	});

    	and('I have push notifications on', () => {
            expect(getUserNotifPerm(user)).toBe(true)
    	});

    	and('the snooze setting isn\'t on', () => {
            expect(isSnoozeOn(user)).toBe(false)
    	});

    	then('I will receive a push notification', () => {
            // according to notification docs, test this on device
    	});
    });

    test('Camera doesn\'t sense a detection', ({ given, when, and, then }) => {
    	let user: User
        
        given('I am not home', () => {
            user = new User("usernameTest", "43789826743", true)
    	});

    	when('my camera doesn\'t sense a detection', () => {
            // nothing happens
    	});

    	and('I have push notifications on', () => {
            expect(getUserNotifPerm(user)).toBe(true)
    	});

    	and('the snooze setting isn\'t on', () => {
            expect(isSnoozeOn(user)).toBe(false)
    	});

    	then('I will not receive a push notification', () => {
            // according to notification docs, test this on device
    	});
    });

    test('Snooze on', ({ given, when, and, then }) => {
        let user: User

    	given('I am home', () => {
            user = new User("usernameTest", "43789826743", true)
    	});

    	when('my camera senses a detection', () => {
            // tested in camera
    	});

    	and('the snooze setting is on', () => {
            expect(isSnoozeOn(user)).toBe(false)
    	});

    	then('I will not receive a push notification', () => {

    	});
    });


});