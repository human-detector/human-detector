export const apiLink = 'http://eyespy.tkw';
export const loginUrlExtension = '/auth/login/';
export const getUsersCamerasUrlExtension = (userId: string): string => `/users/${userId}/cameras`;
export const getSendNotifKeyUrlExtension = (userId: string): string =>
  `/users/${userId}/notifyToken`;
export const getGroupsListUrlExtension = (userId: string): string => `/users/${userId}/groups`;
export const getNotificationHistoryUrlExtension = (userId: string): string =>
  `/users/${userId}/notifications`;
export const exchangeCodeForTokenUrlExtension = '/auth/userAccessToken';
