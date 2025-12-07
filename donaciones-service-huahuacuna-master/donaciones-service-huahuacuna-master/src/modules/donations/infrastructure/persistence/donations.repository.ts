import { Injectable } from '@nestjs/common';
import { Prisma, DonationStatus, DonationType } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service.js';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';

@Injectable()
export class DonationsRepository implements IDonationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createDonation(data: Partial<Donation>): Promise<Donation> {
    const donation = await this.prisma.donation.create({
      data: {
        type: data.type!,
        paymentMethod: data.paymentMethod!,
        status: data.status || DonationStatus.PENDING,
        amount: data.amount!,
        currency: data.currency || 'COP',
        donorUserId: data.donorUserId,
        donorName: data.donorName!,
        donorEmail: data.donorEmail!,
        donorPhone: data.donorPhone,
        donorDocumentType: data.donorDocumentType,
        donorDocument: data.donorDocument,
        projectId: data.projectId,
        projectName: data.projectName,
        transactionId: data.transactionId!,
        pseReference: data.pseReference,
        inKindDescription: data.inKindDescription,
        inKindEstimatedValue: data.inKindEstimatedValue,
        message: data.message,
        isAnonymous: data.isAnonymous || false,
      },
    });
    return new Donation(donation as any);
  }

  async findDonationById(id: number): Promise<Donation | null> {
    const donation = await this.prisma.donation.findUnique({ where: { id } });
    return donation ? new Donation(donation as any) : null;
  }

  async findDonationByTransactionId(transactionId: string): Promise<Donation | null> {
    const donation = await this.prisma.donation.findUnique({ where: { transactionId } });
    return donation ? new Donation(donation as any) : null;
  }

  async findAllDonations(params: {
    status?: DonationStatus;
    type?: DonationType;
    donorUserId?: number;
    skip?: number;
    take?: number;
    orderBy?: 'createdAt' | 'amount';
    orderDirection?: 'asc' | 'desc';
  }): Promise<{ donations: Donation[]; total: number }> {
    const where: Prisma.DonationWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.donorUserId) where.donorUserId = params.donorUserId;

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.orderBy || 'createdAt']: params.orderDirection || 'desc' },
      }),
      this.prisma.donation.count({ where }),
    ]);

    return {
      donations: donations.map((d) => new Donation(d as any)),
      total,
    };
  }

  async updateDonation(id: number, data: Partial<Donation>): Promise<Donation> {
    const donation = await this.prisma.donation.update({
      where: { id },
      data: {
        status: data.status,
        pseReference: data.pseReference,
        pseApprovalCode: data.pseApprovalCode,
        pseTransactionDate: data.pseTransactionDate,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
      },
    });
    return new Donation(donation as any);
  }

  async approveDonation(id: number, approvedBy?: number): Promise<Donation> {
    const donation = await this.prisma.donation.update({
      where: { id },
      data: {
        status: DonationStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy,
      },
    });
    return new Donation(donation as any);
  }

  async rejectDonation(id: number): Promise<Donation> {
    const donation = await this.prisma.donation.update({
      where: { id },
      data: { status: DonationStatus.REJECTED },
    });
    return new Donation(donation as any);
  }

  async countByStatus(status: DonationStatus): Promise<number> {
    return this.prisma.donation.count({ where: { status } });
  }

  async getTotalAmount(filters?: { status?: DonationStatus; donorUserId?: number }): Promise<number> {
    const result = await this.prisma.donation.aggregate({
      where: {
        status: filters?.status,
        donorUserId: filters?.donorUserId,
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getUserDonations(userId: number, params?: {
    skip?: number;
    take?: number;
  }): Promise<{ donations: Donation[]; total: number; totalAmount: number }> {
    const where = { donorUserId: userId };

    const [donations, total, totalAmountResult] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donation.count({ where }),
      this.prisma.donation.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      donations: donations.map((d) => new Donation(d as any)),
      total,
      totalAmount: totalAmountResult._sum.amount || 0,
    };
  }

  async getUserDonationsByYear(userId: number, year: number): Promise<{
    donations: Donation[];
    totalAmount: number;
  }> {
    const startDate = new Date(year, 0, 1); // 1 de enero
    const endDate = new Date(year, 11, 31, 23, 59, 59); // 31 de diciembre

    const [donations, totalAmountResult] = await Promise.all([
      this.prisma.donation.findMany({
        where: {
          donorUserId: userId,
          status: DonationStatus.APPROVED,
          approvedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { approvedAt: 'asc' },
      }),
      this.prisma.donation.aggregate({
        where: {
          donorUserId: userId,
          status: DonationStatus.APPROVED,
          approvedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      donations: donations.map((d) => new Donation(d as any)),
      totalAmount: totalAmountResult._sum.amount || 0,
    };
  }

  async findAllWithFilters(filters: {
    status?: DonationStatus;
    type?: DonationType;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    donorEmail?: string;
    projectId?: number;
  }): Promise<Donation[]> {
    const where: Prisma.DonationWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.donorEmail) where.donorEmail = { contains: filters.donorEmail };
    if (filters.projectId) where.projectId = filters.projectId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    const donations = await this.prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return donations.map((d) => new Donation(d as any));
  }
}
