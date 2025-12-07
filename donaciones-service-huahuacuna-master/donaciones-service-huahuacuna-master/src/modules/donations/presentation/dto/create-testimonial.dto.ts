import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  donorName: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  donorPhoto?: string;

  @IsString()
  @IsNotEmpty()
  testimonial: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  donationAmount?: number;

  @IsInt()
  createdBy: number;
}
