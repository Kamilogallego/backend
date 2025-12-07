import { Injectable, Inject } from '@nestjs/common';
import type { IDonorTestimonialRepository } from '../../domain/repositories/donor-testimonial.repository.interface.js';
import { DonorTestimonial } from '../../domain/entities/donor-testimonial.entity.js';
import { DONOR_TESTIMONIAL_REPOSITORY } from '../../donations.constants.js';

@Injectable()
export class GetPublishedTestimonialsUseCase {
  constructor(
    @Inject(DONOR_TESTIMONIAL_REPOSITORY)
    private readonly testimonialRepository: IDonorTestimonialRepository,
  ) {}

  async execute(limit: number = 10): Promise<DonorTestimonial[]> {
    return await this.testimonialRepository.getPublishedTestimonials(limit);
  }
}
