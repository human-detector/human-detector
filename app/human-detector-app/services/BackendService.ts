import axios from 'axios';
import { executeNativeBackPress } from 'react-native-screens';
import { z } from 'zod';
import Group from '../classes/Group';
import * as ServerUrl from '../config/ServerConfig';

// Get group endpoint
export async function getGroupListAPI(userIdFromLogin: string): Promise<object[] | null> {
  const apiLinkWithExtension: string =
    ServerUrl.apiLink + ServerUrl.getGroupsListUrlExtension(userIdFromLogin);
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

  console.log(testData);
  if (!success) {
    return null;
  }

  return testData;

  const GetGroupsOutput = z
    .object({
      id: z.string(),
      name: z.string(),
      cameras: z.object({ id: z.string(), name: z.string() }).array(),
    })
    .array();

  type GetGroupsOutputT = z.infer<typeof GetGroupsOutput>;

  const parseResult = GetGroupsOutput.safeParse(testData);
  if (parseResult.success) {
    return parseResult.data;
  }
  // cry
  return [];
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

// Login endpoint
export function loginUserAPI() {}
