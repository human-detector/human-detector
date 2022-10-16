import { Module } from '@nestjs/common';
import { IAUTH_SERVICE_TOKEN } from './auth-service.interface';
import { JwtIdentityGuard } from './jwt-identity.guard';
import { KeycloakAuthService } from './keycloak-auth.service';

@Module({
  providers: [
    {
      provide: IAUTH_SERVICE_TOKEN,
      useClass: KeycloakAuthService('users'),
    },
    JwtIdentityGuard,
  ],
  exports: [JwtIdentityGuard, IAUTH_SERVICE_TOKEN],
})
export class AuthModule {}
