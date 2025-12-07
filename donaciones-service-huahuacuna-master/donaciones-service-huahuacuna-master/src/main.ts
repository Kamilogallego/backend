import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { AppModule } from './app.module.js';
import { EnvsConfig } from './config/env.config.js';

const logger = new Logger('Donaciones Service');

const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [EnvsConfig.KAFKA_BROKER],
      },
      consumer: {
        groupId: 'donaciones-consumer',
      },
      producer: {
        createPartitioner: Partitioners.DefaultPartitioner,
      },
    },
  },
);

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);

await app.listen();
logger.log(`Donaciones Microservice running on port ${EnvsConfig.PORT}`);
