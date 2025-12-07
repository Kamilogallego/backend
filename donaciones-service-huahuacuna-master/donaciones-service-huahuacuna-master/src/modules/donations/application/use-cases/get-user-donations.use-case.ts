import { Injectable, Inject } from '@nestjs/common';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';

@Injectable()
export class GetUserDonationsUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
  ) {}

  async execute(userId: number, params?: {
    skip?: number;
    take?: number;
  }): Promise<{ donations: Donation[]; total: number; totalAmount: number }> {
    return await this.donationsRepository.getUserDonations(userId, params);
  }
}
