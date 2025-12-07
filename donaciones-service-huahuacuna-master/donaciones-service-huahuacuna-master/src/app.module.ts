import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { JwtModule } from '@nestjs/jwt';
import { EnvsConfig } from './config/env.config.js';
import { DonationsModule } from './modules/donations/donations.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: EnvsConfig.JWT_SECRET,
      signOptions: {
        expiresIn: '24h',
      },
    }),
    HealthModule,
    DonationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
