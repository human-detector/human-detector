import axios from 'axios';
import { executeNativeBackPress } from 'react-native-screens';
import { z } from 'zod';
import Group from '../classes/Group';
import User from '../classes/User';
import Notification from '../classes/Notification';
import * as ServerUrl from '../config/ServerConfig';

// Get group endpoint
export async function getGroupListAPI(userId: string): Promise<Group[] | null> {
  const apiLinkWithExtension: string =
    ServerUrl.apiLink + ServerUrl.getGroupsListUrlExtension(userId);
  let testData: any;
  let success: boolean = false;
  const config = {
    headers: {
      Accept: 'application/json',
    },
  };

  await axios
    .get(apiLinkWithExtension, config)
    .then((response) => {
      testData = response.data;
      success = true;
    })
    .catch((error) => {
      console.error(`Error code: ${error.response.status}`);
    });

  if (!success) {
    return null;
  }

  return testData;
}

// Send notification key
// PUT /users/<uuid>/notifyToken
// 200 ok 401 bad
export async function sendNotifyTokenAPI(
  userIdFromLogin: string,
  expoTokenFromLogin: string
): Promise<string> {
  let successful: boolean = false;
  let testData: string;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  const apiLinkWithExtension: string =
    ServerUrl.apiLink + ServerUrl.getSendNotifKeyUrlExtension(userIdFromLogin);
  await axios
    .put(
      apiLinkWithExtension,
      {
        expoToken: expoTokenFromLogin,
      },
      config
    )
    .then((response) => {
      successful = true;

      testData = response.status.toString();
    })
    .catch((error) => {
      testData = error.response.status.toString();
    });

  return testData;
}

// Get notification history
export async function getNotificationHistoryAPI(userId: string): Promise<Notification[] | null> {
  const apiLinkWithExtension: string =
    ServerUrl.apiLink + ServerUrl.getNotificationHistoryUrlExtension(userId);
  let testData: any;
  let success: boolean = false;
  const config = {
    headers: {
      Accept: 'application/json',
    },
  };
  await axios
    .get(apiLinkWithExtension, config)
    .then((response) => {
      testData = response.data;
      success = true;
    })
    .catch((error) => {
      console.error(`Error code: ${error.response.status}`);
    });

  if (!success) {
    return null;
  }

  return testData;
}
