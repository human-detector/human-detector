import * as React from 'react';
import { authenticateLogin, loginUser, getUserNotifPerm, isSnoozeOn } from '../user/User';
import renderer from 'react-test-renderer';
import User from '../user/User';


//mock server
const nock = require('nock')

const scope = nock('https://api.github.com')
  .get('/repos/atom/atom/license')
  .reply(200, {
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
      node_id: 'MDc6TGljZW5zZTEz',
    },
  })

//authenticateLogin()
it("test", () => {
    nock.
})

//loginUser()
//critical values: wrong username, wrong password, wrong password and username, correct information

//getUserNotifPerm()
//critical values: perms on, perms off

//isSnoozeOn()
//critical values: snooze on, snooze off

