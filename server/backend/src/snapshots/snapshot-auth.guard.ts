import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  IAuthService,
  IAUTH_SERVICE_TOKEN,
} from '../auth/auth-service.interface';
import { jwtFromAuthHeader } from '../auth/jwt';
import { SnapshotsService } from './snapshots.service';

/**
 * Only allow snapshot access to the owner of the camera this snapshot came from.
 */
@Injectable()
export class SnapshotAuthGuard implements CanActivate {
  constructor(
    private snapshotsService: SnapshotsService,
    @Inject(IAUTH_SERVICE_TOKEN)
    private authService: IAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const snapshotId = request.params['id'];
    if (snapshotId === undefined) {
      return false;
    }
    const auth = request.header('Authorization');
    let jwtString = undefined;
    try {
      jwtString = jwtFromAuthHeader(auth);
    } catch (error) {
      console.error(`Malformed authorization header value "${auth}":`, error);
      throw new UnauthorizedException();
    }
    try {
      const ownerId = await this.snapshotsService.getSnapshotOwnerId(
        snapshotId,
      );
      const jwt = await this.authService.verify(jwtString);
      return jwt.payload.sub === ownerId;
    } catch (error) {
      throw new ForbiddenException();
    }
  }
}
