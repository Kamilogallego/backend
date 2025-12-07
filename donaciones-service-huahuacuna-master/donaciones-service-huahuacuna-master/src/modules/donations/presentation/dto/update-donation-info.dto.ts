import { IsString, IsOptional, MaxLength, IsInt, IsBoolean, IsArray } from 'class-validator';

export class UpdateDonationInfoDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  importance?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  modalities?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  ctaTitle?: string;

  @IsString()
  @IsOptional()
  ctaDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ctaButtonText?: string;

  @IsArray()
  @IsOptional()
  neededItems?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(500)
  contactAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactEmail?: string;

  @IsString()
  @IsOptional()
  scheduleInfo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  updatedBy: number;
}
