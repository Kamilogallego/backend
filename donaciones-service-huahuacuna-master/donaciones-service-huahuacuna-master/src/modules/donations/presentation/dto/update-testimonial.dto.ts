import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateTestimonialDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  donorName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  donorPhoto?: string;

  @IsString()
  @IsOptional()
  testimonial?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  donationAmount?: number;
}
