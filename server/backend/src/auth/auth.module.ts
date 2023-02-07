import { Module } from '@nestjs/common';
import { IAUTH_SERVICE_TOKEN } from './auth-service.interface';
import { JwtIdentityGuard } from './jwt-identity.guard';
import { OpenIDAuthService } from './open-id-auth.service';

@Module({
  providers: [
    {
      provide: IAUTH_SERVICE_TOKEN,
      useClass: OpenIDAuthService,
    },
    JwtIdentityGuard,
  ],
  exports: [JwtIdentityGuard, IAUTH_SERVICE_TOKEN],
})
export class AuthModule {}
