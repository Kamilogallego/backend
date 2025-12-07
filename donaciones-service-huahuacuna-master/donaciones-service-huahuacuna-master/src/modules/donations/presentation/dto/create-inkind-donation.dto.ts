import { IsString, IsNotEmpty, IsEmail, IsInt, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateInKindDonationDto {
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
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}
