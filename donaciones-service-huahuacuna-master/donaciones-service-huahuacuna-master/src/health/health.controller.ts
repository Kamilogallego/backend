import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator.js';

@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
  ) {}

  @MessagePattern('donaciones_health_check')
  @HealthCheck()
  async check() {
    try {
      this.logger.debug('Health check requested via Kafka');
      const result = await this.health.check([
        () => this.prisma.isHealthy('database'),
      ]);
      return {
        ...result,
        service: 'donaciones-service',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Health check failed: ${errorMessage}`);
      return {
        status: 'error',
        service: 'donaciones-service',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @MessagePattern('donaciones_ping')
  ping() {
    return {
      status: 'ok',
      service: 'donaciones-service',
      timestamp: new Date().toISOString(),
    };
  }
}
