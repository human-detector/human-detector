import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default class User {
  username: string;

  userID: string;

  loggedIn: boolean;

  constructor(username: string, userID: string, loggedIn: boolean) {
    this.username = username;
    this.userID = userID; // Should always be from authorization token
    this.loggedIn = loggedIn;
  }

  set setUserID(userID: string) {
    this.userID = userID;
  }
}

// will look through database
export function isValidUsername(username: string): boolean {
  return false;
}

export function isValidPassword(password: string): boolean {
  return false;
}

export function authenticateLogin(username: string, password: string): boolean {
  return false;
}

export function loginUser(): User {
  return new User('name', 'ID', false);
}

export function isSnoozeOn(user: User): boolean {
  return true;
}
