import { IsString, IsNotEmpty, IsArray, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateDonationInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  importance: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  modalities: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  ctaTitle: string;

  @IsString()
  @IsNotEmpty()
  ctaDescription: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ctaButtonText: string;

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

  @IsInt()
  updatedBy: number;
}
