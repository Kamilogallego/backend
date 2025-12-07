import { Injectable, Inject } from '@nestjs/common';
import { DonationStatus, DonationType } from '@prisma/client';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';

interface GetAllDonationsInput {
  status?: DonationStatus;
  type?: DonationType;
  skip?: number;
  take?: number;
  orderBy?: 'createdAt' | 'amount';
  orderDirection?: 'asc' | 'desc';
}

@Injectable()
export class GetAllDonationsUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
  ) {}

  async execute(input: GetAllDonationsInput = {}): Promise<{ donations: Donation[]; total: number }> {
    return await this.donationsRepository.findAllDonations({
      status: input.status,
      type: input.type,
      skip: input.skip || 0,
      take: input.take || 20,
      orderBy: input.orderBy || 'createdAt',
      orderDirection: input.orderDirection || 'desc',
    });
  }
}
