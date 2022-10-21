import { useAuthRequest } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import * as CryptoJS from 'crypto-js';
import Constants from 'expo-constants';
import User from '../../classes/User';

const clientId = Constants.manifest?.extra?.clientId;

/**
 * getAuthRequest() will return what useAuthRequest() returns, using the
 * code verifier (into SHA256) and redirectUri that is generated in a KeyCloaInstance.
 *
 * @param discovery DiscoverDocument from KeyCloak
 * @param redirectUri redirectUri parameter AuthSession uses to redirect user back to mobile app
 * @param codeVerifier randomized code verifier
 * @returns
 *    response: holds authorization request params with access code
 *    promptAsync: method that will redirect user to KeyCloak for authorization
 */
export function getAuthRequest(
  discovery: AuthSession.DiscoveryDocument | null,
  redirectUri: string,
  codeVerifier: string
): [
  AuthSession.AuthRequest | null,
  AuthSession.AuthSessionResult | null,
  () => Promise<AuthSession.AuthSessionResult>
] {
  const config: AuthSession.AuthRequestConfig = {
    clientId,
    scopes: ['openid'],
    redirectUri,
    extraParams: {
      code_challenge: CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64url),
    },
  };

  return useAuthRequest(config, discovery);
}

/**
 * Takes the access code as parameter and exchanges the access code for an
 * authorization token from Keycloak.
 *
 * @param code Access code from getAuthRequest() and promptAsync
 * @param discovery Discovery document from Keycloak
 * @param codeVerifier randomized codeVerifier to be used by
 * @returns TokenResponse which includes authrorization token
 */
export async function exchangeCodeForToken(
  code: string,
  discovery: AuthSession.DiscoveryDocument | null,
  codeVerifier: string,
  redirectUri: string
): Promise<AuthSession.TokenResponse | void> {
  const tokenSet = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      redirectUri,
      code,
      extraParams: {
        code_verifier: codeVerifier,
      },
    },
    discovery
  ).catch((error) => {
    // Error
    console.log(error);
    return Promise.reject(error);
  });
  return tokenSet;
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

export async function refreshKeycloakToken(
  tokenResponse: AuthSession.TokenResponse,
  discovery: AuthSession.DiscoveryDocument
): Promise<AuthSession.TokenResponse> {
  try {
    const config: AuthSession.TokenRequestConfig = {
      clientId,
      scopes: ['openid'],
    };

    const newTokenResponse = await tokenResponse.refreshAsync(config, discovery);

    return newTokenResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
