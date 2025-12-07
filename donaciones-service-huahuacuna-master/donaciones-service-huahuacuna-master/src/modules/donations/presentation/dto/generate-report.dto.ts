import { IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportType {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsInt()
  @Min(2020)
  @Max(new Date().getFullYear())
  @Type(() => Number)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number; // Solo requerido para reportes mensuales
}
