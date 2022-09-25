import * as React from 'react';
import renderer from 'react-test-renderer';
import Notification, { addNotification, sendNotification } from '../notification/Notification';

// addNotification()
// critical values: empty notification history
it('addNotification() Test 1: adding notification to empty history returns with non-empty history', () => {
  expect(addNotification(new Notification(), []).length).toBe(1);
});

it('addNotification() Test 2: notification history already with one notification in it', () => {
  const arr = [];
  arr[0] = new Notification();
  expect(addNotification(new Notification(), arr).length).toBe(2);
});

it('addNotification() Test 3: notification history already with one notification in it value test', () => {
  const arr = [];
  arr[0] = new Notification();
  const add = new Notification();
  expect(addNotification(add, arr)[1]).toBe(add);
});

// sendNotification()
// this will be tested on the device
