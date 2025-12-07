import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EnvsConfig } from '../../config/env.config.js';

interface DonationEmailData {
  donorName: string;
  donorEmail: string;
  amount: number;
  transactionId: string;
  donationDate: Date;
  projectName?: string;
  message?: string;
}

interface ReceiptEmailData extends DonationEmailData {
  pseReference?: string;
  pseApprovalCode?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envía email de confirmación cuando se crea una donación
   */
  async sendDonationConfirmation(data: DonationEmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.donorEmail,
        subject: 'Confirmación de Donación - Fundación Huahuacuna',
        template: 'donation-confirmation',
        context: {
          donorName: data.donorName,
          amount: this.formatCurrency(data.amount),
          transactionId: data.transactionId,
          donationDate: this.formatDate(data.donationDate),
          projectName: data.projectName || 'Fondo General',
          message: data.message,
          appUrl: EnvsConfig.APP_URL,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Confirmation email sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email: ${error.message}`, error.stack);
      // No lanzamos el error para no afectar el flujo principal
    }
  }

  /**
   * Envía recibo de donación aprobada
   */
  async sendDonationReceipt(data: ReceiptEmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.donorEmail,
        subject: 'Recibo de Donación - Fundación Huahuacuna',
        template: 'donation-receipt',
        context: {
          donorName: data.donorName,
          amount: this.formatCurrency(data.amount),
          transactionId: data.transactionId,
          pseReference: data.pseReference,
          pseApprovalCode: data.pseApprovalCode,
          donationDate: this.formatDate(data.donationDate),
          projectName: data.projectName || 'Fondo General',
          message: data.message,
          appUrl: EnvsConfig.APP_URL,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Receipt email sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send receipt email: ${error.message}`, error.stack);
    }
  }

  /**
   * Envía notificación de donación rechazada
   */
  async sendDonationRejected(data: DonationEmailData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.donorEmail,
        subject: 'Estado de su Donación - Fundación Huahuacuna',
        template: 'donation-rejected',
        context: {
          donorName: data.donorName,
          amount: this.formatCurrency(data.amount),
          transactionId: data.transactionId,
          donationDate: this.formatDate(data.donationDate),
          appUrl: EnvsConfig.APP_URL,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Rejection email sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send rejection email: ${error.message}`, error.stack);
    }
  }

  /**
   * Envía notificación de donación en especie recibida
   */
  async sendInKindDonationNotification(data: {
    donorName: string;
    donorEmail: string;
    description: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.donorEmail,
        subject: 'Registro de Donación en Especie - Fundación Huahuacuna',
        template: 'inkind-donation',
        context: {
          donorName: data.donorName,
          description: data.description,
          appUrl: EnvsConfig.APP_URL,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`In-kind donation notification sent to ${data.donorEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send in-kind notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Formatea el monto en pesos colombianos
   */
  private formatCurrency(amountInCents: number): string {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Formatea la fecha
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
