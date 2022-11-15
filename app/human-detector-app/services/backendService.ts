import axios, { AxiosInstance } from 'axios';
import { ImageURISource } from 'react-native';
import Camera from '../classes/Camera';
import Group from '../classes/Group';
import Notification from '../classes/Notification';
import User from '../classes/User';
import * as ServerUrl from '../config/ServerConfig';
import TokenManager from '../src/auth/tokenManager';

/**
 * Handles authenticated requests to the backend.
 */
export default class BackendService {
  private readonly tokenManager: TokenManager;

  /**
   * Axios instance with common headers added (mainly auth)
   */
  private readonly axiosInstance: AxiosInstance;

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;

    // Add authorization and accept headers to each request
    this.axiosInstance = axios.create();
    this.axiosInstance.interceptors.request.use(async (config) => {
      const accessToken = await this.tokenManager.getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      Object.assign(config.headers!.common, headers);
      return config;
    });
  }

  public getUser(): User {
    return this.tokenManager.getUser();
  }

  /**
   * Registers the camera in the backend and returns the UUID of it.
   *
   * @param name New camera name
   * @param serial New camera serial
   * @param publicKey New camera's public key
   * @param groupId Group ID to put camera in
   * @returns Camera UUID
   */
  public async registerCamera(
    name: string,
    serial: string,
    publicKey: string,
    groupId: string
  ): Promise<string | null> {
    const apiLinkWithExtension: string =
      ServerUrl.apiLink + ServerUrl.registerCameraUrlExtension(this.getUser().userId, groupId);

    try {
      const response = await this.axiosInstance.put(apiLinkWithExtension, {
        name,
        serial,
        publicKey,
      });

      return response.data.id;
    } catch (error) {
      console.error(`Error in registerCamera status code:`, error);
      return null;
    }
  }

  /**
   * registerGroupAPI() will register a group in the backend to the user.
   *
   * @param name Group name (user input)
   * @returns
   */
  public async registerGroupAPI(name: string): Promise<string | null> {
    const apiLinkWithExtension: string =
      ServerUrl.apiLink + ServerUrl.registerGroupUrlExtension(this.getUser().userId);

    try {
      const response = await this.axiosInstance.put(apiLinkWithExtension, {
        name,
      });

      return response.data.id;
    } catch (error) {
      console.error('Error in registerGroup status code:', error);
      return null;
    }
  }

  /**
   * This method is used to get the group list that is connected to a user.  This group list
   * will contain cameras and other information that will be stored as a group object.
   *
   * @returns null if error occurs.
   *          An array of Groups that are owned by the user with the userId.
   */
  public async getGroupListAPI(): Promise<Group[] | null> {
    try {
      const apiLinkWithExtension: string =
        ServerUrl.apiLink + ServerUrl.getGroupsListUrlExtension(this.getUser().userId);

      const response = await this.axiosInstance.get(apiLinkWithExtension);
      return BackendService.responseIntoGroupArray(response.data);
    } catch (error) {
      console.error(`Error in getGroupListAPI status code:`, error);
      return null;
    }
  }

  /**
   * This method will send a notification token to the backend to be stored
   * through our endpoints.  This is done at login.
   *
   * @param expoTokenFromLogin : notification token of the user that just logged in
   * @returns void if success, else it will return the error message
   */
  public async sendNotifyTokenAPI(expoTokenFromLogin: string): Promise<void> {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const apiLinkWithExtension: string =
        ServerUrl.apiLink + ServerUrl.getSendNotifKeyUrlExtension(this.getUser().userId);

      await this.axiosInstance.put(
        apiLinkWithExtension,
        {
          expoToken: expoTokenFromLogin,
        },
        config
      );
      return undefined;
    } catch (error) {
      console.error(`Error in sendNotifyAPI status code:`, error);
      return Promise.reject(error);
    }
    // no error: return void
  }

  /**
   * This method will get the notification history of a certain user through the backend.
   *
   * @returns null if error
   *          An array of notifications resembling notification history
   */
  public async getNotificationHistoryAPI(): Promise<Notification[] | null> {
    try {
      const apiLinkWithExtension: string =
        ServerUrl.apiLink + ServerUrl.getNotificationHistoryUrlExtension(this.getUser().userId);
      const config = {
        headers: {
          Accept: 'application/json',
        },
      };

      const response = await this.axiosInstance.get(apiLinkWithExtension, config);
      return response.data;
    } catch (error) {
      console.error(`Error in getNotificationHistoryAPI status code:`, error);
      return null;
    }
  }

  /**
   * Construct an image URI for use in React's Image component with added authorization headers.
   * Snapshots are access-controlled, so we need to inject the authorization header into requests.
   * @param snapshotId snapshot ID
   * @returns source with authorization header injected
   */
  public async getSnapshotSource(snapshotId: string): Promise<ImageURISource> {
    const accessToken = await this.tokenManager.getAccessToken();
    const uri = `${ServerUrl.apiLink}${ServerUrl.snapshotUrl(snapshotId)}`;
    return {
      uri,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
  }

  private static responseIntoGroupArray(response: any): Group[] {
    return response.map((group: any) => {
      // TODO: Get notification array
      const newCamArr = group.cameras.map((cam: any) => {
        const newNotifArr = cam.notifications.map(
          (notif: any) => new Notification(notif.id, new Date(notif.timestamp), notif.snapshotId)
        );
        return new Camera(cam.name, cam.id, newNotifArr);
      });
      return new Group(group.name, group.id, newCamArr);
    });
  }
}
