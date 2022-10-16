import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { IAUTH_SERVICE_TOKEN, IAuthService } from './auth-service.interface';

/**
 * Restricts resource access (routes with an 'id' parameter) to the owner of that resource
 * by verifying a bearer JWT.
 *
 * For example, /users/:id/groups is only accessible to the user with ID ':id'.
 */
@Injectable()
export class JwtIdentityGuard implements CanActivate {
  constructor(@Inject(IAUTH_SERVICE_TOKEN) private authService: IAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const id = request.params['id'];
    if (id === undefined) {
      return true;
    }
    const auth = request.header('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      console.log(`Malformed authorization header: ${auth}`);
      throw new UnauthorizedException();
    }
    const jwt = auth.split(' ')[1];
    try {
      const verifyResult = await this.authService.verify(jwt);
      const sub = verifyResult.payload.sub;
      return sub !== undefined && sub === id;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
