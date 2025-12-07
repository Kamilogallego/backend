import { Injectable, Inject } from '@nestjs/common';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { ExcelService } from '../../../excel/excel.service.js';
import { DonationStatus, DonationType } from '@prisma/client';

interface ExportFilters {
  status?: DonationStatus;
  type?: DonationType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  donorEmail?: string;
  projectId?: number;
}

@Injectable()
export class ExportDonationsUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly excelService: ExcelService,
  ) {}

  async execute(filters: ExportFilters): Promise<Buffer> {
    const donations = await this.donationsRepository.findAllWithFilters({
      status: filters.status,
      type: filters.type,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      donorEmail: filters.donorEmail,
      projectId: filters.projectId,
    });

    return await this.excelService.exportarDonaciones(donations);
  }
}
