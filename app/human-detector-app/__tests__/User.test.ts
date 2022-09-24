import * as React from 'react';
import { authenticateLogin, loginUser, getUserNotifPerm, isSnoozeOn } from '../classes/User';
import renderer from 'react-test-renderer';
import User from '../classes/User';
import { apiLink, loginUrlExtension } from '../config/ServerConfig';


//mock server
const nock = require('nock')

//authenticateLogin()
//Critical values: correct pass, incorrect pass
it("authenticateLogin() Test 1: correct login information should return true", () => {

  const scope = nock(apiLink)
    .get(loginUrlExtension)
    .reply(200, 'successful')
    expect(authenticateLogin('testUsername', 'testPassword')).toBe(true)
})

it("authenticateLogin() Test 2: incorrect login information should return false", () => {
  const scope = nock(apiLink)
    .get(loginUrlExtension)
    .reply(200, 'successful')
    expect(authenticateLogin('testUsername', 'testPassword')).toBe(false)
})


//getUserNotifPerm()
//critical values: perms on, perms off

it('getUserNotifPerm() Test 1: Notifications on should return true', () => {
  const user = new User('name', 'ID', true)
  expect(getUserNotifPerm(user)).toBe(true)
})

it('getUserNotifPerm() Tets 2: Notifications off should return false', () => {
  const user = new User('name', 'ID', true)
  expect(getUserNotifPerm(user)).toBe(false)
})

//isSnoozeOn()
//critical values: snooze on, snooze off
it('isSnoozeOn() Test 1: Notifications on should return true', () => {
  const user = new User('name', 'ID', true)
  expect(isSnoozeOn(user)).toBe(true)
})

it('isSnoozeOn() Tets 2: Notifications off should return false', () => {
  const user = new User('name', 'ID', true)
  expect(isSnoozeOn(user)).toBe(false)
})


