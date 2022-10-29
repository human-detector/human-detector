import CryptoJS from 'crypto-js';
import User from '../../classes/User';

/**
 * Temporary codeVerifier generator
 * @param size size of the string
 * @returns generated random codeVerifier
 */
// TODO: Change this thing
export function genCodeVerifier(size: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const charLength = chars.length;
  let result = '';
  for (let i = 0; i < size; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

/**
 * The getUserFromIDToken() method will make a user from information
 * from an idToken.
 *
 * @param idToken idToken from TokenResponse
 * @returns user with information from idToken
 */
export function getUserFromIDToken(idToken: string): User {
  const words = CryptoJS.enc.Base64.parse(idToken.split('.')[1]); // Get the payload
  const textString = CryptoJS.enc.Utf8.stringify(words);

  const user = new User(
    JSON.parse(textString).preferred_username,
    JSON.parse(textString).sub,
    true // they should be logged in when getting here
  );

  return user;
}
