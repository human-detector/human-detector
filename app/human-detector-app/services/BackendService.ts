import axios from 'axios';
import * as ServerUrl from '../config/ServerConfig';

// Get group endpoint
export async function getGroupListAPI(userIdFromLogin);

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
        userId: userIdFromLogin,
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

// Login endpoint
export function loginUserAPI() {}

//
