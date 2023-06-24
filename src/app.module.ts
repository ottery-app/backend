import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SeshModule } from './features/sesh/sesh.module';
import { RolesGuardProvider } from './features/roles/roles.guard';
import { DbModule } from './features/db/db.module';
import { ApiLoggerMiddleware } from './features/logger/ApiLoggerMiddleware.middleware';
import { ChildModule } from './features/child/child.module';
import { EventModule } from './features/event/event.module';
import { FormModule } from './features/form/form.module';
import { DataModule } from './features/data/data.module';
import { TempZoneModule } from './features/tempzone/tempzone.module';
import { SocialModule } from './features/social/social.module';
import { NotificationModule } from './features/notifications/notification.module';
import { MessageModule } from './features/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    AuthModule,
    SeshModule,
    ChildModule,
    EventModule,
    FormModule,
    DataModule,
    TempZoneModule,
    SocialModule,
    NotificationModule,
    MessageModule,
  ],
  controllers: [],
  providers: [
    RolesGuardProvider
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiLoggerMiddleware).forRoutes('*');
  }
}