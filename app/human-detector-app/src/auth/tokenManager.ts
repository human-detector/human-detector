import { DiscoveryDocument, TokenResponse } from 'expo-auth-session';
import User from '../../classes/User';
import { getUserFromIDToken } from './helpers';

/**
 * Handles access to and refreshing of credentials for the backend.
 */
export default class TokenManager {
  private tokenResponse: TokenResponse;

  private discovery: DiscoveryDocument;

  private clientId: string;

  private constructor(
    tokenResponse: TokenResponse,
    discovery: DiscoveryDocument,
    clientId: string
  ) {
    this.tokenResponse = tokenResponse;
    this.discovery = discovery;
    this.clientId = clientId;
  }

  /**
   * Construct a TokenManager from an AuthSession token response, assuming that the response has
   * all of the required fields (refresh token, expiration, and ID token).
   * @param response AuthSession TokenResponse
   * @param discovery endpoint discovery document
   * @param clientId
   * @returns a new TokenManager
   */
  public static fromTokenResponse(
    response: TokenResponse,
    discovery: DiscoveryDocument,
    clientId: string
  ) {
    return new this(response, discovery, clientId);
  }

  /**
   * Get the access token, refreshing as needed.
   */
  public async getAccessToken(): Promise<string> {
    if (this.tokenResponse.shouldRefresh()) {
      this.tokenResponse = await this.tokenResponse.refreshAsync(
        { clientId: this.clientId },
        this.discovery
      );
    }
    return this.tokenResponse.accessToken;
  }

  /**
   * Get the user from their identity token, assuming there is one.
   */
  public getUser(): User {
    // FIXME: stupid!
    return getUserFromIDToken(this.tokenResponse.idToken!);
  }
}
