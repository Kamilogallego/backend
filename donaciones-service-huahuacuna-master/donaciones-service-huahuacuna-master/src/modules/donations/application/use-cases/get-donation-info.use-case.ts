import { Injectable, Inject } from '@nestjs/common';
import type { IDonationInfoRepository } from '../../domain/repositories/donation-info.repository.interface.js';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { DonationInfo } from '../../domain/entities/donation-info.entity.js';
import { DONATION_INFO_REPOSITORY, DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { DonationStatus } from '@prisma/client';

@Injectable()
export class GetDonationInfoUseCase {
  constructor(
    @Inject(DONATION_INFO_REPOSITORY)
    private readonly donationInfoRepository: IDonationInfoRepository,
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
  ) {}

  async execute(): Promise<DonationInfo | null> {
    const info = await this.donationInfoRepository.getActiveDonationInfo();

    if (info) {
      // Actualizar estadísticas en tiempo real
      const [approvedCount, totalAmount] = await Promise.all([
        this.donationsRepository.countByStatus(DonationStatus.APPROVED),
        this.donationsRepository.getTotalAmount({ status: DonationStatus.APPROVED }),
      ]);

      info.totalDonationsCount = approvedCount;
      info.totalAmount = totalAmount;
    }

    return info;
  }
}
