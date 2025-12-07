import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IDonorTestimonialRepository } from '../../domain/repositories/donor-testimonial.repository.interface.js';
import { DonorTestimonial } from '../../domain/entities/donor-testimonial.entity.js';
import { DONOR_TESTIMONIAL_REPOSITORY } from '../../donations.constants.js';

interface CreateTestimonialInput {
  donorName: string;
  donorPhoto?: string;
  testimonial: string;
  donationAmount?: number;
  createdBy: number;
}

interface UpdateTestimonialInput {
  id: number;
  donorName?: string;
  donorPhoto?: string;
  testimonial?: string;
  donationAmount?: number;
}

@Injectable()
export class ManageTestimonialsUseCase {
  constructor(
    @Inject(DONOR_TESTIMONIAL_REPOSITORY)
    private readonly testimonialRepository: IDonorTestimonialRepository,
  ) {}

  async getAll(params?: { skip?: number; take?: number }) {
    return await this.testimonialRepository.getAllTestimonials(params);
  }

  async create(input: CreateTestimonialInput): Promise<DonorTestimonial> {
    return await this.testimonialRepository.createTestimonial(input);
  }

  async update(input: UpdateTestimonialInput): Promise<DonorTestimonial> {
    try {
      return await this.testimonialRepository.updateTestimonial(input.id, input);
    } catch (error) {
      throw new NotFoundException(`Testimonial with ID ${input.id} not found`);
    }
  }

  async publish(id: number): Promise<DonorTestimonial> {
    try {
      return await this.testimonialRepository.publishTestimonial(id);
    } catch (error) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }

  async unpublish(id: number): Promise<DonorTestimonial> {
    try {
      return await this.testimonialRepository.unpublishTestimonial(id);
    } catch (error) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.testimonialRepository.deleteTestimonial(id);
    } catch (error) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }
}
