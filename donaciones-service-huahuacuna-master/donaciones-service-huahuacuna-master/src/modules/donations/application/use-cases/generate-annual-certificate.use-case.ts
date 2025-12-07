import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { PdfService } from '../../../pdf/pdf.service.js';

interface GenerateAnnualCertificateInput {
  userId: number;
  year: number;
}

@Injectable()
export class GenerateAnnualCertificateUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly pdfService: PdfService,
  ) {}

  async execute(input: GenerateAnnualCertificateInput): Promise<Buffer> {
    // Validar que el año sea anterior al actual
    const currentYear = new Date().getFullYear();
    if (input.year >= currentYear) {
      throw new BadRequestException(
        `Los certificados solo se pueden generar para años anteriores. ` +
          `El año actual es ${currentYear}, el último certificado disponible es del ${currentYear - 1}.`,
      );
    }

    // Obtener donaciones del usuario para el año especificado
    const { donations, totalAmount } = await this.donationsRepository.getUserDonationsByYear(
      input.userId,
      input.year,
    );

    // Validar que haya donaciones
    if (donations.length === 0) {
      throw new NotFoundException(
        `No se encontraron donaciones aprobadas para el año ${input.year}`,
      );
    }

    // Validar monto mínimo para certificado ($50.000 COP)
    if (totalAmount < 5000000) {
      throw new BadRequestException(
        'El monto total de donaciones debe ser mayor a $50.000 COP para generar un certificado',
      );
    }

    // Obtener datos del primer donación para información del donante
    const firstDonation = donations[0];

    if (!firstDonation.donorDocument || !firstDonation.donorDocumentType) {
      throw new BadRequestException(
        'No se puede generar el certificado porque faltan datos del documento de identidad. ' +
          'Por favor, actualiza tu información de perfil.',
      );
    }

    // Generar el PDF
    const pdfBuffer = await this.pdfService.generarCertificadoDonacion({
      año: input.year,
      donorName: firstDonation.donorName,
      donorDocumentType: firstDonation.donorDocumentType,
      donorDocument: firstDonation.donorDocument,
      totalAmount,
      fechaEmision: new Date(),
    });

    return pdfBuffer;
  }
}
