import { DynamicModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from '@nestjs/config';

const MongooseModuleForRoot:DynamicModule = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      uri: config.get<string>('MONGODB_URI_ADMIN'), // Loaded from .ENV
    })
});

@Module({
    imports: [MongooseModuleForRoot],
    exports: [MongooseModuleForRoot],
})
export class DbModule{}
