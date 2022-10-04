import * as React from 'react';
import renderer from 'react-test-renderer';
import User, { authenticateLogin, loginUser, getUserNotifPerm, isSnoozeOn } from '../classes/User';
import { apiLink, loginUrlExtension } from '../config/ServerConfig';

// getUserNotifPerm()
// critical values: perms on, perms off

it('getUserNotifPerm() Test 1: Notifications on should return true', () => {
  const user = new User('name', 'ID', true);
  expect(getUserNotifPerm(user)).toBe(true);
});

it('getUserNotifPerm() Tets 2: Notifications off should return false', () => {
  const user = new User('name', 'ID', true);
  expect(getUserNotifPerm(user)).toBe(false);
});

// isSnoozeOn()
// critical values: snooze on, snooze off
it('isSnoozeOn() Test 1: Notifications on should return true', () => {
  const user = new User('name', 'ID', true);
  expect(isSnoozeOn(user)).toBe(true);
});

it('isSnoozeOn() Tets 2: Notifications off should return false', () => {
  const user = new User('name', 'ID', true);
  expect(isSnoozeOn(user)).toBe(false);
});
