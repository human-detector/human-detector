import { decodeJwt } from 'jose';

/**
 * Verify that the given string is a Bearer JWT, throwing if it isn't.
 * @param header value from the 'authorization' header
 * @returns the JWT string
 */
export function jwtFromAuthHeader(header: string | undefined): string {
  if (!header || !header.startsWith('Bearer ')) {
    throw new Error('Malformed authorization header');
  }
  const jwt = header.split(' ')[1];
  // Attempt to decode the JWT, throwing if the structure is invalid
  decodeJwt(jwt);
  return jwt;
}
