import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DonationType, PaymentMethod, DonationStatus } from '@prisma/client';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { PseService } from '../../../pse/pse.service.js';
import { EmailService } from '../../../email/email.service.js';
import * as crypto from 'crypto';

interface CreateMonetaryDonationInput {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorDocumentType?: string;
  donorDocument?: string;
  donorUserId?: number;
  projectId?: number;
  projectName?: string;
  message?: string;
  isAnonymous?: boolean;
}

@Injectable()
export class CreateMonetaryDonationUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly pseService: PseService,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: CreateMonetaryDonationInput): Promise<{
    donation: Donation;
    paymentUrl?: string;
    pseReference?: string;
  }> {
    if (input.amount < 1000000) {
      throw new BadRequestException('El monto mínimo es $10.000 COP');
    }

    const transactionId = this.generateTransactionId();

    // Crear la donación en estado PENDING
    const donation = await this.donationsRepository.createDonation({
      type: DonationType.MONETARY,
      paymentMethod: PaymentMethod.PSE,
      status: DonationStatus.PENDING,
      amount: input.amount,
      currency: 'COP',
      donorUserId: input.donorUserId,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorPhone: input.donorPhone,
      donorDocumentType: input.donorDocumentType,
      donorDocument: input.donorDocument,
      projectId: input.projectId,
      projectName: input.projectName,
      transactionId,
      message: input.message,
      isAnonymous: input.isAnonymous || false,
    });

    // Iniciar transacción PSE
    const pseResponse = await this.pseService.initiateTransaction({
      amount: input.amount,
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      donorDocument: input.donorDocument,
      donorDocumentType: input.donorDocumentType,
      transactionId,
      description: `Donación a ${input.projectName || 'Fundación Huahuacuna'}`,
    });

    if (!pseResponse.success) {
      throw new BadRequestException(
        pseResponse.errorMessage || 'No se pudo iniciar la transacción PSE',
      );
    }

    // Actualizar donación con referencia PSE
    const updatedDonation = await this.donationsRepository.updateDonation(donation.id, {
      pseReference: pseResponse.pseReference,
    });

    // Enviar email de confirmación
    await this.emailService.sendDonationConfirmation({
      donorName: input.donorName,
      donorEmail: input.donorEmail,
      amount: input.amount,
      transactionId,
      donationDate: donation.createdAt,
      projectName: input.projectName,
      message: input.message,
    });

    return {
      donation: updatedDonation,
      paymentUrl: pseResponse.paymentUrl,
      pseReference: pseResponse.pseReference,
    };
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `DON-${timestamp}-${random}`.toUpperCase();
  }
}
