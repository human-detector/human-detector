import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, JWTVerifyResult, importSPKI, decodeJwt } from 'jose';
import { IAuthService } from './auth-service.interface';
import jwksClient, { JwksClient } from 'jwks-rsa';
import axios from 'axios';
import { InvalidJwtError } from '../errors.types';

/**
 * Verify JWTs using a configured OpenID Connect endpoint ('.well-known')
 */
@Injectable()
export class OpenIDAuthService implements IAuthService {
  private jwksClient: JwksClient | null;

  constructor(private configService: ConfigService) {}

  /**
   * Get the JWKS URI for a given realm.
   */
  private async getJwksUri(): Promise<URL> {
    const oidcEndpoint =
      this.configService.getOrThrow<string>('auth.oidc_endpoint');
    const url = new URL(`${oidcEndpoint}/.well-known/openid-configuration`);
    const discoveryResponse = await axios
      .get(url.href)
      .then((response) => response.data);
    let jwksUrl = new URL(discoveryResponse['jwks_uri']);
    // Keycloak might switch the host on us in 'discoveryResponse', so replace it
    jwksUrl = new URL(jwksUrl.pathname, `${url.origin}`);
    return jwksUrl;
  }

  private async initJwksClient() {
    const jwksUri = await this.getJwksUri();
    this.jwksClient = jwksClient({ jwksUri: jwksUri.toString() });
  }

  public async verify(jwt: string): Promise<JWTVerifyResult> {
    // Verify that the given JWT is actually a valid, base64-encoded string.
    // This will throw if it isn't.
    try {
      decodeJwt(jwt);
    } catch (error) {
      throw new InvalidJwtError();
    }
    if (!this.jwksClient) {
      await this.initJwksClient();
    }
    const jwtHeader = JSON.parse(
      Buffer.from(jwt.split('.')[0], 'base64').toString(),
    );
    if (!jwtHeader || !jwtHeader['kid']) {
      throw new InvalidJwtError('Missing "kid" in header');
    }
    const publicKey = await this.jwksClient.getSigningKey(jwtHeader['kid']);
    const importedKey = await importSPKI(
      publicKey.getPublicKey(),
      publicKey.alg,
    );
    return jwtVerify(jwt, importedKey);
  }
}
