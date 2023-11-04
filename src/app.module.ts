import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuardProvider } from './features/auth/roles/roles.guard';
import { DbModule } from './features/db/db.module';
import { ApiLoggerMiddleware } from './features/logger/ApiLoggerMiddleware.middleware';
import { PermsGuardPrivider } from './features/perms/perms.guard';
import { SeshGuardProvider } from './features/auth/sesh/sesh.guard';
import { AlertModule } from './features/alert/alert.module';
import { CoreModule } from './features/core/core.module';
import { SocialModule } from './features/social/social.module';
import { UserModule } from './features/user/user.module';
import { ChildModule } from './features/child/child.module';
import { EventModule } from './features/event/event.module';
import { FormModule } from './features/form/form.module';
import { DataModule } from './features/data/data.module';
import { TempZoneModule } from './features/tempzone/tempzone.module';
import { MessageModule } from './features/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    AuthModule,
    AlertModule,
    //CoreModule,
    UserModule,
    ChildModule,
    EventModule,
    FormModule,
    DataModule,
    TempZoneModule,
    SocialModule,
    MessageModule,
  ],
  controllers: [],
  providers: [
    SeshGuardProvider,
    RolesGuardProvider,
    PermsGuardPrivider,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}