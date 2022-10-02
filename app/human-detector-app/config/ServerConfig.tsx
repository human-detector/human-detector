
export const apiLink = 'http://eyespy.tkw'
export const loginUrlExtension = '/auth/login/'
export const getUsersCamerasUrlExtension = (userId: string): string => `/users/${userId}/cameras`;
export const getSendNotifKeyUrlExtension = (userId: string): string => `/users/${userId}/notifyToken`;