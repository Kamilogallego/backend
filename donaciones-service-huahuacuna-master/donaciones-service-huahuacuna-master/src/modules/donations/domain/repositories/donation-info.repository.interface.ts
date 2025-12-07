import { DonationInfo } from '../entities/donation-info.entity.js';

export interface IDonationInfoRepository {
  getActiveDonationInfo(): Promise<DonationInfo | null>;
  createDonationInfo(data: Partial<DonationInfo>): Promise<DonationInfo>;
  updateDonationInfo(id: number, data: Partial<DonationInfo>): Promise<DonationInfo>;
  updateStatistics(stats: {
    totalDonationsCount?: number;
    totalAmount?: number;
    beneficiariesCount?: number;
  }): Promise<DonationInfo>;
}
