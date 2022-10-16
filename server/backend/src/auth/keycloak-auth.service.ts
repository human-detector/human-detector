import { Injectable, mixin, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, JWTVerifyResult, importSPKI, decodeJwt } from 'jose';
import { IAuthService } from './auth-service.interface';
import jwksClient, { JwksClient } from 'jwks-rsa';
import axios from 'axios';
import { InvalidJwtError } from '../errors.types';

/**
 * Verify tokens issued by the given Keycloak realm.
 * @param realm Keycloak realm to verify tokens in
 * @returns a mixin type with the given realm
 */
export function KeycloakAuthService(realm: string): Type<IAuthService> {
  @Injectable()
  class AuthService implements IAuthService {
    private jwksClient: JwksClient | null;

    constructor(private configService: ConfigService) {}

    /**
     * Get the JWKS URI for a given realm.
     */
    private async getJwksUri(realm: string): Promise<URL> {
      const keycloakUseTls =
        this.configService.get('keycloak.use_tls') !== undefined;
      const keycloakHost =
        this.configService.getOrThrow<string>('keycloak.host');
      const scheme = keycloakUseTls ? 'https' : 'http';
      const url = new URL(
        `/realms/${realm}/.well-known/openid-configuration`,
        `${scheme}://${keycloakHost}`,
      );
      const discoveryResponse = await axios
        .get(url.href)
        .then((response) => response.data);
      let jwksUrl = new URL(discoveryResponse['jwks_uri']);
      // Keycloak might switch the host on us in 'discoveryResponse', so replace it
      jwksUrl = new URL(jwksUrl.pathname, `${scheme}://${keycloakHost}`);
      return jwksUrl;
    }

    private async initJwksClient() {
      const jwksUri = await this.getJwksUri(realm);
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
  return mixin(AuthService);
}
