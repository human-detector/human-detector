import * as AuthSession from 'expo-auth-session';
import * as CryptoJS from 'crypto-js';
import { genCodeVerifier } from './helpers';
import TokenManager from './tokenManager';

/**
 * Fetch a token set from an OpenID Identity Provider using the Authorization Code Grant Flow.
 */
export default class TokenFetcher {
  // ID of the client registered with the issuer
  private readonly clientId: string;

  // OpenID Identity Provider's issuer URL, used for endpoint discovery.
  private readonly issuer: URL;

  // URI to redirect to after the code grant flow.
  private readonly redirectUri: string;

  // Used during the flow to prevent stuff idk
  private codeVerifier: string;

  private discovery: AuthSession.DiscoveryDocument | null = null;

  constructor(clientId: string, issuer: URL, redirectUri: string) {
    this.clientId = clientId;
    this.issuer = issuer;
    this.redirectUri = redirectUri;
    this.codeVerifier = '';
  }

  /**
   * Create a new auth request using the given client config.
   */
  private makeAuthRequest(): AuthSession.AuthRequest {
    this.codeVerifier = genCodeVerifier(100);
    const config: AuthSession.AuthRequestConfig = {
      clientId: this.clientId,
      scopes: ['openid'],
      redirectUri: this.redirectUri,
      extraParams: {
        code_challenge: CryptoJS.SHA256(this.codeVerifier).toString(CryptoJS.enc.Base64url),
      },
    };
    return new AuthSession.AuthRequest(config);
  }

  private async exchangeCodeForToken(
    code: string,
    discovery: AuthSession.DiscoveryDocument
  ): Promise<AuthSession.TokenResponse | void> {
    return AuthSession.exchangeCodeAsync(
      {
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        code,
        extraParams: {
          code_verifier: this.codeVerifier,
        },
      },
      discovery
    );
  }

  /**
   * Fetch credentials from the identity provider, returning a managed token set.
   * This manager will refresh credentials as needed.
   */
  public async getTokenManager(): Promise<TokenManager> {
    const request = this.makeAuthRequest();
    const discovery = await AuthSession.fetchDiscoveryAsync(this.issuer.toString());
    const response = await request.promptAsync(discovery, { showInRecents: true });
    if (response.type !== 'success') {
      throw new Error(`Expected successful auth response, got type ${response.type}`);
    }
    const { code } = response.params;
    const tokenResponse = await this.exchangeCodeForToken(code, discovery);
    if (tokenResponse === undefined) {
      throw new Error("Auth code grant flow didn't give back a token response!");
    }
    return TokenManager.fromTokenResponse(tokenResponse, discovery, this.clientId);
  }
}
