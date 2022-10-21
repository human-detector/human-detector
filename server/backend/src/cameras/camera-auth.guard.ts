import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CamerasService } from './cameras.service';
import { verify } from 'crypto';
import { stringToBytes } from '../util';

/**
 * Require cameras to present their signed ID.
 *
 * Note: any route using this guard must have an ID parameter (e.g. '/cameras/:id/notifications')
 * or every request will be rejected.
 */
@Injectable()
export class CameraAuthGuard implements CanActivate {
  constructor(private cameraService: CamerasService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const id = request.params['id'];
    if (id === undefined) {
      return false;
    }
    const signature = request.header('Authorization');
    if (signature === undefined) {
      throw new UnauthorizedException();
    }
    const publicKey = await this.cameraService.getPublicKey(id).catch(() => {
      throw new ForbiddenException();
    });
    if (
      !verify(
        undefined,
        stringToBytes(id),
        publicKey,
        Buffer.from(signature, 'base64'),
      )
    ) {
      throw new ForbiddenException();
    }
    return true;
  }
}
