import { CameraAuthGuard } from './camera-auth.guard';
import { CamerasService } from './cameras.service';
import { createMock } from '@golevelup/ts-jest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { sign, generateKeyPairSync, verify } from 'crypto';
import { v4 } from 'uuid';
import { stringToBytes } from '../util';
import { NotFoundError } from '../errors.types';
import { createMockHttpExecutionContext } from '../../test/helpers/execution-context';

describe(CameraAuthGuard, () => {
  it('should approve requests with valid keys', async () => {
    const mockCamerasService = createMock<CamerasService>();
    const cameraAuthGuard = new CameraAuthGuard(mockCamerasService);

    const cameraId = v4();
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    mockCamerasService.getPublicKey.mockResolvedValueOnce(
      publicKey.export({ format: 'pem', type: 'spki' }).toString(),
    );
    const signature = sign(
      undefined,
      stringToBytes(cameraId),
      privateKey,
    ).toString('base64');
    expect(
      verify(
        undefined,
        stringToBytes(cameraId),
        publicKey,
        Buffer.from(signature, 'base64'),
      ),
    ).toBe(true);
    const mockExecutionContext = createMockHttpExecutionContext({
      params: { id: cameraId },
      headers: { authorization: signature },
    });
    expect(cameraAuthGuard.canActivate(mockExecutionContext)).resolves.toBe(
      true,
    );
    expect(mockCamerasService.getPublicKey).toBeCalledTimes(1);
  });

  it('should approve requests without auth to endpoints with no camera ID', () => {
    const mockCamerasService = createMock<CamerasService>();
    const cameraAuthGuard = new CameraAuthGuard(mockCamerasService);
    const mockExecutionContext = createMockHttpExecutionContext();

    expect(cameraAuthGuard.canActivate(mockExecutionContext)).resolves.toBe(
      true,
    );
  });

  it('should not approve requests to protected endpoints made without auth', () => {
    const mockCamerasService = createMock<CamerasService>();
    const cameraAuthGuard = new CameraAuthGuard(mockCamerasService);
    const mockExecutionContext = createMockHttpExecutionContext({
      params: { id: v4() },
    });

    expect(cameraAuthGuard.canActivate(mockExecutionContext)).rejects.toEqual(
      new UnauthorizedException(),
    );
  });

  it("should not approve requests made with another cameras's credentials", () => {
    const attackerKeyPair = generateKeyPairSync('ed25519');
    const realKeyPair = generateKeyPairSync('ed25519');
    const cameraId = v4();

    const mockCamerasService = createMock<CamerasService>();
    const cameraAuthGuard = new CameraAuthGuard(mockCamerasService);
    const signature = sign(
      undefined,
      stringToBytes(cameraId),
      attackerKeyPair.privateKey,
    ).toString('base64');
    const mockExecutionContext = createMockHttpExecutionContext({
      params: { id: v4() },
      headers: { authorization: signature },
    });
    mockCamerasService.getPublicKey.mockResolvedValueOnce(
      realKeyPair.publicKey.export({ format: 'pem', type: 'spki' }).toString(),
    );

    expect(cameraAuthGuard.canActivate(mockExecutionContext)).rejects.toEqual(
      new ForbiddenException(),
    );
  });

  it('should not approve requests for unregistered camera IDs', () => {
    const attackerKeyPair = generateKeyPairSync('ed25519');
    const bogusCameraId = v4();

    const mockCamerasService = createMock<CamerasService>();
    const cameraAuthGuard = new CameraAuthGuard(mockCamerasService);
    const signature = sign(
      undefined,
      stringToBytes(bogusCameraId),
      attackerKeyPair.privateKey,
    ).toString('base64');
    const mockExecutionContext = createMockHttpExecutionContext({
      params: { id: v4() },
      headers: { authorization: signature },
    });
    mockCamerasService.getPublicKey.mockRejectedValueOnce(
      new NotFoundError(`Camera with ID ${bogusCameraId} does not exist`),
    );

    expect(cameraAuthGuard.canActivate(mockExecutionContext)).rejects.toEqual(
      new ForbiddenException(),
    );
  });

  it('should not approve requests with junk authorization', () => {
    const mockCamerasService = createMock<CamerasService>();
    const cameraAuthGuard = new CameraAuthGuard(mockCamerasService);
    const mockExecutionContext = createMockHttpExecutionContext({
      params: { id: v4() },
      headers: { authorization: 'bogus' },
    });
    const { publicKey } = generateKeyPairSync('ed25519');
    mockCamerasService.getPublicKey.mockRejectedValueOnce(
      publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    );

    expect(cameraAuthGuard.canActivate(mockExecutionContext)).rejects.toEqual(
      new ForbiddenException(),
    );
  });
});
