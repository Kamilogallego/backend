import { DonorTestimonial } from '../entities/donor-testimonial.entity.js';

export interface IDonorTestimonialRepository {
  getPublishedTestimonials(limit?: number): Promise<DonorTestimonial[]>;
  getAllTestimonials(params?: {
    skip?: number;
    take?: number;
  }): Promise<{ testimonials: DonorTestimonial[]; total: number }>;
  createTestimonial(data: Partial<DonorTestimonial>): Promise<DonorTestimonial>;
  updateTestimonial(id: number, data: Partial<DonorTestimonial>): Promise<DonorTestimonial>;
  publishTestimonial(id: number): Promise<DonorTestimonial>;
  unpublishTestimonial(id: number): Promise<DonorTestimonial>;
  deleteTestimonial(id: number): Promise<void>;
}
