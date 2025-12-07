import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service.js';
import type { IDonationInfoRepository } from '../../domain/repositories/donation-info.repository.interface.js';
import { DonationInfo } from '../../domain/entities/donation-info.entity.js';

@Injectable()
export class DonationInfoRepository implements IDonationInfoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveDonationInfo(): Promise<DonationInfo | null> {
    const info = await this.prisma.donationInfo.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    return info ? new DonationInfo(info as any) : null;
  }

  async createDonationInfo(data: Partial<DonationInfo>): Promise<DonationInfo> {
    const info = await this.prisma.donationInfo.create({
      data: {
        title: data.title!,
        description: data.description!,
        importance: data.importance!,
        destination: data.destination!,
        modalities: data.modalities!,
        ctaTitle: data.ctaTitle!,
        ctaDescription: data.ctaDescription!,
        ctaButtonText: data.ctaButtonText!,
        totalDonationsCount: data.totalDonationsCount || 0,
        totalAmount: data.totalAmount || 0,
        beneficiariesCount: data.beneficiariesCount || 0,
        neededItems: data.neededItems || [],
        contactAddress: data.contactAddress,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        scheduleInfo: data.scheduleInfo,
        isActive: data.isActive ?? true,
        updatedBy: data.updatedBy!,
      },
    });
    return new DonationInfo(info as any);
  }

  async updateDonationInfo(id: number, data: Partial<DonationInfo>): Promise<DonationInfo> {
    const info = await this.prisma.donationInfo.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        importance: data.importance,
        destination: data.destination,
        modalities: data.modalities,
        ctaTitle: data.ctaTitle,
        ctaDescription: data.ctaDescription,
        ctaButtonText: data.ctaButtonText,
        neededItems: data.neededItems,
        contactAddress: data.contactAddress,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        scheduleInfo: data.scheduleInfo,
        isActive: data.isActive,
        updatedBy: data.updatedBy,
      },
    });
    return new DonationInfo(info as any);
  }

  async updateStatistics(stats: {
    totalDonationsCount?: number;
    totalAmount?: number;
    beneficiariesCount?: number;
  }): Promise<DonationInfo> {
    const activeInfo = await this.getActiveDonationInfo();
    if (!activeInfo) {
      throw new Error('No active donation info found');
    }

    const info = await this.prisma.donationInfo.update({
      where: { id: activeInfo.id },
      data: {
        totalDonationsCount: stats.totalDonationsCount,
        totalAmount: stats.totalAmount,
        beneficiariesCount: stats.beneficiariesCount,
      },
    });
    return new DonationInfo(info as any);
  }
}
