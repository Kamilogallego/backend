import { Module } from '@nestjs/common';
import { PseService } from './pse.service.js';

@Module({
  providers: [PseService],
  exports: [PseService],
})
export class PseModule {}
