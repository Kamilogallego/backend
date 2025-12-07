import { IsOptional, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { DonationStatus, DonationType } from '@prisma/client';

export class GetDonationsQueryDto {
  @IsEnum(DonationStatus)
  @IsOptional()
  status?: DonationStatus;

  @IsEnum(DonationType)
  @IsOptional()
  type?: DonationType;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  skip?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  take?: number;

  @IsString()
  @IsOptional()
  orderBy?: 'createdAt' | 'amount';

  @IsString()
  @IsOptional()
  orderDirection?: 'asc' | 'desc';
}
