import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service.js';
import type { IDonorTestimonialRepository } from '../../domain/repositories/donor-testimonial.repository.interface.js';
import { DonorTestimonial } from '../../domain/entities/donor-testimonial.entity.js';

@Injectable()
export class DonorTestimonialRepository implements IDonorTestimonialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPublishedTestimonials(limit: number = 10): Promise<DonorTestimonial[]> {
    const testimonials = await this.prisma.donorTestimonial.findMany({
      where: {
        isPublished: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return testimonials.map((t) => new DonorTestimonial(t as any));
  }

  async getAllTestimonials(params?: {
    skip?: number;
    take?: number;
  }): Promise<{ testimonials: DonorTestimonial[]; total: number }> {
    const [testimonials, total] = await Promise.all([
      this.prisma.donorTestimonial.findMany({
        skip: params?.skip,
        take: params?.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donorTestimonial.count(),
    ]);

    return {
      testimonials: testimonials.map((t) => new DonorTestimonial(t as any)),
      total,
    };
  }

  async createTestimonial(data: Partial<DonorTestimonial>): Promise<DonorTestimonial> {
    const testimonial = await this.prisma.donorTestimonial.create({
      data: {
        donorName: data.donorName!,
        donorPhoto: data.donorPhoto,
        testimonial: data.testimonial!,
        donationAmount: data.donationAmount,
        isPublished: data.isPublished || false,
        createdBy: data.createdBy!,
      },
    });
    return new DonorTestimonial(testimonial as any);
  }

  async updateTestimonial(id: number, data: Partial<DonorTestimonial>): Promise<DonorTestimonial> {
    const testimonial = await this.prisma.donorTestimonial.update({
      where: { id },
      data: {
        donorName: data.donorName,
        donorPhoto: data.donorPhoto,
        testimonial: data.testimonial,
        donationAmount: data.donationAmount,
      },
    });
    return new DonorTestimonial(testimonial as any);
  }

  async publishTestimonial(id: number): Promise<DonorTestimonial> {
    const testimonial = await this.prisma.donorTestimonial.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    return new DonorTestimonial(testimonial as any);
  }

  async unpublishTestimonial(id: number): Promise<DonorTestimonial> {
    const testimonial = await this.prisma.donorTestimonial.update({
      where: { id },
      data: {
        isPublished: false,
      },
    });
    return new DonorTestimonial(testimonial as any);
  }

  async deleteTestimonial(id: number): Promise<void> {
    await this.prisma.donorTestimonial.delete({
      where: { id },
    });
  }
}
