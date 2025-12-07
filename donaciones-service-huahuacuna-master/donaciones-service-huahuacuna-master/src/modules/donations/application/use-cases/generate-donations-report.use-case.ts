import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IDonationsRepository } from '../../domain/repositories/donations.repository.interface.js';
import { DONATIONS_REPOSITORY } from '../../donations.constants.js';
import { ExcelService, ReporteResumen } from '../../../excel/excel.service.js';
import { DonationStatus, DonationType } from '@prisma/client';

interface GenerateReportInput {
  type: 'monthly' | 'annual';
  year: number;
  month?: number;
}

@Injectable()
export class GenerateDonationsReportUseCase {
  constructor(
    @Inject(DONATIONS_REPOSITORY)
    private readonly donationsRepository: IDonationsRepository,
    private readonly excelService: ExcelService,
  ) {}

  async execute(input: GenerateReportInput): Promise<Buffer> {
    if (input.type === 'monthly' && !input.month) {
      throw new BadRequestException('Month is required for monthly reports');
    }

    const { startDate, endDate, periodo } = this.calcularPeriodo(input);

    const donations = await this.donationsRepository.findAllWithFilters({
      startDate,
      endDate,
    });

    const resumen = this.calcularResumen(donations, periodo);

    return await this.excelService.generarReporte(
      resumen,
      donations,
      input.type === 'monthly' ? 'mensual' : 'anual',
    );
  }

  private calcularPeriodo(input: GenerateReportInput): {
    startDate: Date;
    endDate: Date;
    periodo: string;
  } {
    let startDate: Date;
    let endDate: Date;
    let periodo: string;

    if (input.type === 'monthly') {
      startDate = new Date(input.year, input.month! - 1, 1);
      endDate = new Date(input.year, input.month!, 0, 23, 59, 59);
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
      ];
      periodo = `${meses[input.month! - 1]} ${input.year}`;
    } else {
      startDate = new Date(input.year, 0, 1);
      endDate = new Date(input.year, 11, 31, 23, 59, 59);
      periodo = `Año ${input.year}`;
    }

    return { startDate, endDate, periodo };
  }

  private calcularResumen(donations: any[], periodo: string): ReporteResumen {
    const totalDonaciones = donations.length;
    const totalMonetarias = donations.filter((d) => d.type === DonationType.MONETARY).length;
    const totalEspecie = donations.filter((d) => d.type === DonationType.IN_KIND).length;

    const montoTotal = donations.reduce((sum, d) => sum + d.amount, 0);
    const montoAprobado = donations
      .filter((d) => d.status === DonationStatus.APPROVED)
      .reduce((sum, d) => sum + d.amount, 0);
    const montoPendiente = donations
      .filter((d) => d.status === DonationStatus.PENDING)
      .reduce((sum, d) => sum + d.amount, 0);
    const montoRechazado = donations
      .filter((d) => d.status === DonationStatus.REJECTED)
      .reduce((sum, d) => sum + d.amount, 0);

    const donacionesPorEstado = {
      aprobadas: donations.filter((d) => d.status === DonationStatus.APPROVED).length,
      pendientes: donations.filter((d) => d.status === DonationStatus.PENDING).length,
      rechazadas: donations.filter((d) => d.status === DonationStatus.REJECTED).length,
    };

    return {
      periodo,
      totalDonaciones,
      totalMonetarias,
      totalEspecie,
      montoTotal,
      montoAprobado,
      montoPendiente,
      montoRechazado,
      donacionesPorEstado,
    };
  }
}
