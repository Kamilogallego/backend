import { IsString, IsNotEmpty, IsEmail, IsInt, Min, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateMonetaryDonationDto {
  @IsInt()
  @Min(1000000)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  donorName: string;

  @IsEmail()
  @IsNotEmpty()
  donorEmail: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  donorPhone?: string;

  @IsString()
  @IsOptional()
  donorDocumentType?: string;

  @IsString()
  @IsOptional()
  donorDocument?: string;

  @IsInt()
  @IsOptional()
  donorUserId?: number;

  @IsInt()
  @IsOptional()
  projectId?: number;

  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
