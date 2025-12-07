import { Injectable, Inject } from '@nestjs/common';
import { DonationType, PaymentMethod, DonationStatus } from '@prisma/client';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { EmailService } from '../../../email/email.service.js';
import * as crypto from 'crypto';

interface CreateInKindDonationInput {
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  description: string;
  estimatedValue?: number;
  message?: string;
}

@Injectable()
export class CreateInKindDonationUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: CreateInKindDonationInput): Promise<Donation> {
    const transactionId = this.generateTransactionId();

    const donation = await this.donationsRepository.createDonation({
      type: DonationType.IN_KIND,
      paymentMethod: PaymentMethod.IN_KIND,
      status: DonationStatus.PENDING,
      amount: input.estimatedValue || 0,
      currency: 'COP',
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorPhone: input.donorPhone,
      transactionId,
      inKindDescription: input.description,
      inKindEstimatedValue: input.estimatedValue,
      message: input.message,
      isAnonymous: false,
    });

    // Enviar email de notificación
    await this.emailService.sendInKindDonationNotification({
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      description: input.description,
    });

    return donation;
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `INK-${timestamp}-${random}`.toUpperCase();
  }
}
