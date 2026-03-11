import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        type: 'postgres',
        url: config.databaseUrl,
        // Entities are auto-loaded from all *.entity.ts files
        autoLoadEntities: true,
        // Schema is defined in swaswa_schema.sql — never auto-sync
        synchronize: false,
        logging: config.isDevelopment,
      }),
    }),
  ],
})
export class DatabaseModule {}
