import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { EnvsConfig } from '../../config/env.config.js';
import * as crypto from 'crypto';

export interface PseTransactionRequest {
  amount: number; // En centavos
  donorName: string;
  donorEmail: string;
  donorDocument?: string;
  donorDocumentType?: string;
  transactionId: string;
  description: string;
}

export interface PseTransactionResponse {
  success: boolean;
  paymentUrl?: string;
  pseReference?: string;
  errorMessage?: string;
}

export interface PseCallbackData {
  transactionId: string;
  pseReference: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  approvalCode?: string;
  errorMessage?: string;
  bankName?: string;
  transactionDate?: Date;
}

@Injectable()
export class PseService {
  private readonly logger = new Logger(PseService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly isTestMode: boolean;

  constructor() {
    this.isTestMode = EnvsConfig.PSE_MERCHANT_ID === 'test_merchant';

    this.axiosInstance = axios.create({
      baseURL: EnvsConfig.PSE_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Merchant-Id': EnvsConfig.PSE_MERCHANT_ID,
        'X-API-Key': EnvsConfig.PSE_API_KEY,
      },
    });

    if (this.isTestMode) {
      this.logger.warn('PSE Service running in TEST MODE - transactions will be simulated');
    }
  }

  /**
   * Inicia una transacción PSE y retorna la URL de pago
   */
  async initiateTransaction(request: PseTransactionRequest): Promise<PseTransactionResponse> {
    try {
      this.logger.log(`Initiating PSE transaction for ${request.transactionId}`);

      // En modo test, simular la respuesta
      if (this.isTestMode) {
        return this.simulateTransaction(request);
      }

      // Generar firma para la transacción
      const signature = this.generateSignature(request);

      // Llamada real al API de PSE
      const response = await this.axiosInstance.post('/transactions/create', {
        merchant_id: EnvsConfig.PSE_MERCHANT_ID,
        amount: request.amount,
        currency: 'COP',
        reference: request.transactionId,
        description: request.description,
        payer: {
          name: request.donorName,
          email: request.donorEmail,
          document_type: request.donorDocumentType || 'CC',
          document: request.donorDocument,
        },
        return_url: EnvsConfig.PSE_RETURN_URL,
        callback_url: EnvsConfig.PSE_CALLBACK_URL,
        signature,
      });

      if (response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.payment_url,
          pseReference: response.data.reference,
        };
      } else {
        throw new Error(response.data.message || 'PSE transaction failed');
      }
    } catch (error) {
      this.logger.error(`Failed to initiate PSE transaction: ${error.message}`, error.stack);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Verifica el estado de una transacción PSE
   */
  async checkTransactionStatus(pseReference: string): Promise<PseCallbackData> {
    try {
      this.logger.log(`Checking PSE transaction status for ${pseReference}`);

      if (this.isTestMode) {
        return this.simulateStatusCheck(pseReference);
      }

      const response = await this.axiosInstance.get(`/transactions/${pseReference}/status`);

      return {
        transactionId: response.data.merchant_reference,
        pseReference: response.data.reference,
        status: this.mapPseStatus(response.data.status),
        approvalCode: response.data.approval_code,
        bankName: response.data.bank_name,
        transactionDate: new Date(response.data.transaction_date),
      };
    } catch (error) {
      this.logger.error(`Failed to check PSE transaction status: ${error.message}`, error.stack);
      throw new BadRequestException('Error checking transaction status');
    }
  }

  /**
   * Procesa el callback de PSE
   */
  async processCallback(callbackData: any): Promise<PseCallbackData> {
    try {
      this.logger.log(`Processing PSE callback for transaction ${callbackData.merchant_reference}`);

      // Validar firma del callback
      if (!this.isTestMode) {
        const isValid = this.validateCallbackSignature(callbackData);
        if (!isValid) {
          throw new BadRequestException('Invalid callback signature');
        }
      }

      return {
        transactionId: callbackData.merchant_reference,
        pseReference: callbackData.reference,
        status: this.mapPseStatus(callbackData.status),
        approvalCode: callbackData.approval_code,
        errorMessage: callbackData.error_message,
        bankName: callbackData.bank_name,
        transactionDate: new Date(callbackData.transaction_date),
      };
    } catch (error) {
      this.logger.error(`Failed to process PSE callback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Genera firma para la transacción
   */
  private generateSignature(request: PseTransactionRequest): string {
    const data = `${EnvsConfig.PSE_MERCHANT_ID}${request.transactionId}${request.amount}${EnvsConfig.PSE_API_SECRET}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Valida la firma del callback
   */
  private validateCallbackSignature(callbackData: any): boolean {
    const expectedSignature = this.generateSignature({
      transactionId: callbackData.merchant_reference,
      amount: callbackData.amount,
    } as PseTransactionRequest);

    return callbackData.signature === expectedSignature;
  }

  /**
   * Mapea el estado de PSE a nuestro formato
   */
  private mapPseStatus(pseStatus: string): 'APPROVED' | 'REJECTED' | 'PENDING' {
    const statusMap: Record<string, 'APPROVED' | 'REJECTED' | 'PENDING'> = {
      'APPROVED': 'APPROVED',
      'SUCCESS': 'APPROVED',
      'COMPLETED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'FAILED': 'REJECTED',
      'DECLINED': 'REJECTED',
      'PENDING': 'PENDING',
      'PROCESSING': 'PENDING',
    };

    return statusMap[pseStatus.toUpperCase()] || 'PENDING';
  }

  /**
   * Simula una transacción PSE para testing
   */
  private simulateTransaction(request: PseTransactionRequest): PseTransactionResponse {
    const pseReference = `PSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    // URL simulada que redirige al callback con éxito
    const paymentUrl = `${EnvsConfig.APP_URL}/pse-simulator?ref=${pseReference}&tx=${request.transactionId}`;

    this.logger.debug(`Simulated PSE transaction: ${pseReference}`);

    return {
      success: true,
      paymentUrl,
      pseReference,
    };
  }

  /**
   * Simula verificación de estado para testing
   */
  private simulateStatusCheck(pseReference: string): PseCallbackData {
    // En test mode, simular aprobación automática
    return {
      transactionId: pseReference.split('&tx=')[1] || 'TEST-TX',
      pseReference,
      status: 'APPROVED',
      approvalCode: `APPR-${Date.now()}`,
      bankName: 'Banco Test',
      transactionDate: new Date(),
    };
  }
}
