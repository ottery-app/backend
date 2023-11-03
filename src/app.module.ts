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

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    AuthModule,
    AlertModule,
    CoreModule,
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