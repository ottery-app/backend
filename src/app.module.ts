import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuardProvider } from './features/auth/roles/roles.guard';
import { DbModule } from './features/db/db.module';
import { ApiLoggerMiddleware } from './features/logger/ApiLoggerMiddleware.middleware';
import { SeshGuardProvider } from './features/auth/sesh/sesh.guard';
import { CoreModule } from './features/core/core.module';
import { SocialModule } from './features/social/social.module';
import { MessageModule } from './features/message/message.module';
import { InviteModule } from './features/invite/invite.module';
import { SignupModule } from './features/signup/signup.module';
import { RosterModule } from './features/roster/roster.module';
import { PermsModule } from './features/auth/perms/perms.module';

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
    PermsModule,
  ],
  controllers: [],
  providers: [SeshGuardProvider, RolesGuardProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}
