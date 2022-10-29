import { generateKeyPairSync, KeyLike, sign } from 'crypto';
import { stringToBytes } from '../../src/util';
import { Camera } from '../../src/cameras/camera.entity';

export function createCameraWithKeyPair(
  name: string,
  serial: string,
): {
  camera: Camera;
  keyPair: ReturnType<typeof generateKeyPairSync>;
} {
  const keyPair = generateKeyPairSync('ed25519');
  const camera = new Camera(
    name,
    keyPair.publicKey.export({ format: 'pem', type: 'spki' }).toString(),
    serial,
  );
  return { camera, keyPair };
}

/**
 * Returns the auth token for a camera.
 */
export function getCameraAuthToken(
  camera: Camera,
  privateKey: KeyLike,
): string {
  return sign(undefined, stringToBytes(camera.id), privateKey).toString(
    'base64',
  );
}
