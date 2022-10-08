import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import * as CryptoJS from 'crypto-js';

function genCodeVerifier(size: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const charLength = chars.length;
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

/**
 * KeyCloak instance class to hold a KeyCloak auth instance. This object
 * will hold values that will be important to keep track of.
 *
 * To get the authorization token, we need to make sure that codeVerifier and
 * redirectUri stay the same.  These are used for verification of authorization.
 */
export default class KeyCloakInstance {
  // Code verifier to be sent
  codeVerifier: string = '';

  redirectUri: string;

  constructor() {
    this.codeVerifier = genCodeVerifier(100);
    this.redirectUri = makeRedirectUri();
    // Get discovery document
  }

  /**
   * getAuthRequest() will return what useAuthRequest() returns, using the
   * code verifier (into SHA256) and redirectUri that is generated in a KeyCloaInstance.
   *
   * @param discovery DiscoverDocument from KeyCloak
   * @returns
   *    response: holds authorization request params with access code
   *    promptAsync: method that will redirect user to KeyCloak for authorization
   */
  getAuthRequest(
    discovery: AuthSession.DiscoveryDocument | null
  ): [
    AuthSession.AuthRequest | null,
    AuthSession.AuthSessionResult | null,
    () => Promise<AuthSession.AuthSessionResult>
  ] {
    const config: AuthSession.AuthRequestConfig = {
      clientId: 'myclient',
      scopes: ['openid'],
      redirectUri: this.redirectUri,
      extraParams: {
        code_challenge: CryptoJS.SHA256(this.codeVerifier).toString(CryptoJS.enc.Base64url),
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
   * @returns TokenResponse which includes authrorization token
   */
  async exchangeCodeForToken(
    code: string,
    discovery: AuthSession.DiscoveryDocument | null
  ): Promise<AuthSession.TokenResponse | void> {
    const tokenSet = await AuthSession.exchangeCodeAsync(
      {
        clientId: 'myclient',
        redirectUri: this.redirectUri,
        code,
        extraParams: {
          code_verifier: this.codeVerifier,
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
}
