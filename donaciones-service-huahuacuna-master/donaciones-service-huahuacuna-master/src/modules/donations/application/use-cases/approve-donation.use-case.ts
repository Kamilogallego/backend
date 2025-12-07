import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { EmailService } from '../../../email/email.service.js';

@Injectable()
export class ApproveDonationUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(donationId: number, approvedBy?: number): Promise<Donation> {
    const donation = await this.donationsRepository.findDonationById(donationId);
    if (!donation) {
      throw new NotFoundException(`Donación con ID ${donationId} no encontrada`);
    }

    const approvedDonation = await this.donationsRepository.approveDonation(donationId, approvedBy);

    // Enviar email de recibo
    await this.emailService.sendDonationReceipt({
      donorName: approvedDonation.donorName,
      donorEmail: approvedDonation.donorEmail,
      amount: approvedDonation.amount,
      transactionId: approvedDonation.transactionId,
      donationDate: approvedDonation.createdAt,
      projectName: approvedDonation.projectName,
      message: approvedDonation.message,
      pseReference: approvedDonation.pseReference,
      pseApprovalCode: approvedDonation.pseApprovalCode,
    });

    return approvedDonation;
  }
}
