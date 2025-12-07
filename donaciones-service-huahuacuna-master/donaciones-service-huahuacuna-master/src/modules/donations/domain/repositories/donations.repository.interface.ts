import { DonationStatus, DonationType } from '@prisma/client';
import { Donation } from '../entities/donation.entity.js';

export interface IDonationsRepository {
  createDonation(data: Partial<Donation>): Promise<Donation>;
  findDonationById(id: number): Promise<Donation | null>;
  findDonationByTransactionId(transactionId: string): Promise<Donation | null>;
  findAllDonations(params: {
    status?: DonationStatus;
    type?: DonationType;
    donorUserId?: number;
    skip?: number;
    take?: number;
    orderBy?: 'createdAt' | 'amount';
    orderDirection?: 'asc' | 'desc';
  }): Promise<{ donations: Donation[]; total: number }>;
  updateDonation(id: number, data: Partial<Donation>): Promise<Donation>;
  approveDonation(id: number, approvedBy?: number): Promise<Donation>;
  rejectDonation(id: number): Promise<Donation>;
  countByStatus(status: DonationStatus): Promise<number>;
  getTotalAmount(filters?: { status?: DonationStatus; donorUserId?: number }): Promise<number>;
  getUserDonations(userId: number, params?: {
    skip?: number;
    take?: number;
  }): Promise<{ donations: Donation[]; total: number; totalAmount: number }>;
  getUserDonationsByYear(userId: number, year: number): Promise<{
    donations: Donation[];
    totalAmount: number;
  }>;
  findAllWithFilters(filters: {
    status?: DonationStatus;
    type?: DonationType;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    donorEmail?: string;
    projectId?: number;
  }): Promise<Donation[]>;
}
