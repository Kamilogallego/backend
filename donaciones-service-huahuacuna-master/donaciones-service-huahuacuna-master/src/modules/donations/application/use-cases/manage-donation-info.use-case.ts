import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IDonationInfoRepository } from '../../domain/repositories/donation-info.repository.interface.js';
import { DonationInfo } from '../../domain/entities/donation-info.entity.js';
import { DONATION_INFO_REPOSITORY } from '../../donations.constants.js';

interface CreateDonationInfoInput {
  title: string;
  description: string;
  importance: string;
  destination: string;
  modalities: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  neededItems?: string[];
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  scheduleInfo?: string;
  updatedBy: number;
}

interface UpdateDonationInfoInput extends Partial<CreateDonationInfoInput> {
  id: number;
  isActive?: boolean;
}

@Injectable()
export class ManageDonationInfoUseCase {
  constructor(
    @Inject(DONATION_INFO_REPOSITORY)
    private readonly donationInfoRepository: IDonationInfoRepository,
  ) {}

  async create(input: CreateDonationInfoInput): Promise<DonationInfo> {
    return await this.donationInfoRepository.createDonationInfo(input);
  }

  async update(input: UpdateDonationInfoInput): Promise<DonationInfo> {
    try {
      return await this.donationInfoRepository.updateDonationInfo(input.id, input);
    } catch (error) {
      throw new NotFoundException(`Donation info with ID ${input.id} not found`);
    }
  }
}
