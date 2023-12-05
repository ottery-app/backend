import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuardProvider } from './features/auth/roles/roles.guard';
import { DbModule } from './features/db/db.module';

import { ApiLoggerMiddleware } from './features/logger/ApiLoggerMiddleware.middleware';

import { SeshGuardProvider } from './features/auth/sesh/sesh.guard';
import { PermsGuardPrivider } from './features/auth/perms/perms.guard';
import { CoreModule } from './features/core/core.module';
import { SocialModule } from './features/social/social.module';
import { MessageModule } from './features/message/message.module';
import { InviteModule } from './features/invite/invite.module';
import { SignupModule } from './features/signup/signup.module';
import { RosterModule } from './features/roster/roster.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    AuthModule,
    CoreModule,
    SocialModule,
    MessageModule,
    InviteModule,
    SignupModule,
    RosterModule,
  ],
  controllers: [],
  providers: [SeshGuardProvider, RolesGuardProvider, PermsGuardPrivider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}
