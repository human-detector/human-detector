import Constants from 'expo-constants';

export const apiLink =
  Constants.manifest?.extra?.backendUrl != null
    ? Constants.manifest.extra?.backendUrl
    : 'http://www.eyespy.tkw';
export const loginUrlExtension = '/auth/login/';
export const getUsersCamerasUrlExtension = (userId: string): string => `/users/${userId}/cameras/`;
export const getSendNotifKeyUrlExtension = (userId: string): string =>
  `/users/${userId}/notifyToken/`;
export const getGroupsListUrlExtension = (userId: string): string => `/users/${userId}/groups/`;
export const getNotificationHistoryUrlExtension = (userId: string): string =>
  `/users/${userId}/notifications/`;
