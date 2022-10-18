import { CameraAuthGuard } from './camera-auth.guard';
import { CamerasService } from './cameras.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { sign, generateKeyPairSync, verify } from 'crypto';
import { getMockReq } from '@jest-mock/express';
import { v4 } from 'uuid';
import { stringToBytes } from '../util';
import { Request } from 'express';
import { NotFoundError } from '../errors.types';

/**
 * Create a mock HTTP execution context that will return a request with the given parameters.
 */
function createMockHttpExecutionContext(
  requestOptions?: Parameters<typeof getMockReq>[0],
): DeepMocked<ExecutionContext> {
  // '@jest-mock/express' doesn't provide a default header() implementation,
  // so we need to do that ourselves if we want to pass headers as a dict
  if (requestOptions && requestOptions.headers && !requestOptions.header) {
    const mockHeader = jest.fn() as jest.MockedFunction<Request['header']>;
    mockHeader.mockImplementation((name) => {
      const header: string | string[] | undefined =
        requestOptions.headers[name.toLowerCase()];
      if (header === undefined) {
        return undefined;
      } else if (typeof header === 'string') {
        return header;
      } else {
        return header[0];
      }
    });
    requestOptions.header = mockHeader as jest.Mock;
  }
  const mockReq = getMockReq(requestOptions);
  const mockExecutionContext = createMock<ExecutionContext>();
  mockExecutionContext.switchToHttp.mockReturnValueOnce({
    getRequest: <T = any>() => mockReq as unknown as T,
    getNext: () => undefined,
    getResponse: () => undefined,
  });
  return mockExecutionContext;
}

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
