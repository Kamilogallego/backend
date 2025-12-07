import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DonationStatus, DonationType } from '@prisma/client';

export class ExportDonationsDto {
  @IsEnum(DonationStatus)
  @IsOptional()
  status?: DonationStatus;

  @IsEnum(DonationType)
  @IsOptional()
  type?: DonationType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minAmount?: number; // En centavos

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  maxAmount?: number; // En centavos

  @IsString()
  @IsOptional()
  donorEmail?: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  projectId?: number;
}
