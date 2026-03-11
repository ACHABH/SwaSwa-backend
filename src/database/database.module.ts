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
        // TODO: Register your 8 PostgreSQL schemas here via the `schema` option on each entity
        // e.g. @Entity({ name: 'users', schema: 'auth' })
        synchronize: config.isDevelopment, // NEVER true in production
        logging: config.isDevelopment,
      }),
    }),
  ],
})
export class DatabaseModule {}
