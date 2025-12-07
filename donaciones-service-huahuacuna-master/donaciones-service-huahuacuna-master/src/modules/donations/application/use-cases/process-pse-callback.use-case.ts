import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { Donation } from '../../domain/entities/donation.entity.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { PseService, PseCallbackData } from '../../../pse/pse.service.js';
import { EmailService } from '../../../email/email.service.js';
import { DonationStatus } from '@prisma/client';

@Injectable()
export class ProcessPseCallbackUseCase {
  private readonly logger = new Logger(ProcessPseCallbackUseCase.name);

  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly pseService: PseService,
    private readonly emailService: EmailService,
  ) {}

  async execute(callbackData: any): Promise<Donation> {
    this.logger.log(`Processing PSE callback for transaction: ${callbackData.merchant_reference}`);

    // Procesar y validar el callback
    const processedData: PseCallbackData = await this.pseService.processCallback(callbackData);

    // Buscar la donación por ID de transacción
    const donation = await this.donationsRepository.findDonationByTransactionId(
      processedData.transactionId,
    );

    if (!donation) {
      throw new NotFoundException(
        `Donation with transaction ID ${processedData.transactionId} not found`,
      );
    }

    // Actualizar donación según el estado de PSE
    let status: DonationStatus;
    let updateData: any = {
      pseReference: processedData.pseReference,
      pseTransactionDate: processedData.transactionDate,
    };

    switch (processedData.status) {
      case 'APPROVED':
        status = DonationStatus.APPROVED;
        updateData.status = status;
        updateData.approvedAt = new Date();
        updateData.pseApprovalCode = processedData.approvalCode;

        this.logger.log(`Donation ${donation.id} approved via PSE`);

        // Enviar email de recibo
        await this.emailService.sendDonationReceipt({
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          amount: donation.amount,
          transactionId: donation.transactionId,
          donationDate: donation.createdAt,
          projectName: donation.projectName,
          message: donation.message,
          pseReference: processedData.pseReference,
          pseApprovalCode: processedData.approvalCode,
        });
        break;

      case 'REJECTED':
        status = DonationStatus.REJECTED;
        updateData.status = status;

        this.logger.log(`Donation ${donation.id} rejected via PSE`);

        // Enviar email de rechazo
        await this.emailService.sendDonationRejected({
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          amount: donation.amount,
          transactionId: donation.transactionId,
          donationDate: donation.createdAt,
          projectName: donation.projectName,
          message: donation.message,
        });
        break;

      case 'PENDING':
        status = DonationStatus.PENDING;
        updateData.status = status;
        this.logger.log(`Donation ${donation.id} still pending in PSE`);
        break;
    }

    // Actualizar la donación
    const updatedDonation = await this.donationsRepository.updateDonation(donation.id, updateData);

    return updatedDonation;
  }
}
