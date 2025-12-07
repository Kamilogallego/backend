import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.debug('Database health check passed');
      return this.getStatus(key, true, { message: 'PostgreSQL is healthy' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Database health check failed: ${errorMessage}`);
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, {
          message: errorMessage,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
