import { JWTVerifyResult } from 'jose';

export const IAUTH_SERVICE_TOKEN = 'IAuthService';

/**
 * Provider-agnostic JWT verification.
 */
export interface IAuthService {
  verify(jwt: string): Promise<JWTVerifyResult>;
}
