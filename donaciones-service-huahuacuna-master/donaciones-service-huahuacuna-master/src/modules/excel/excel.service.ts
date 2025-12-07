import { Injectable, Logger } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { Donation } from '../donations/domain/entities/donation.entity.js';

export interface ReporteResumen {
  periodo: string;
  totalDonaciones: number;
  totalMonetarias: number;
  totalEspecie: number;
  montoTotal: number;
  montoAprobado: number;
  montoPendiente: number;
  montoRechazado: number;
  donacionesPorEstado: {
    aprobadas: number;
    pendientes: number;
    rechazadas: number;
  };
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  /**
   * Exporta una lista de donaciones a un archivo Excel
   */
  async exportarDonaciones(donaciones: Donation[]): Promise<Buffer> {
    this.logger.log(`Exporting ${donaciones.length} donations to Excel`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fundación Huahuacuna';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Donaciones', {
      properties: { tabColor: { argb: '667eea' } },
    });

    // Configurar columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Donante', key: 'donante', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Documento', key: 'documento', width: 20 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Proyecto', key: 'proyecto', width: 25 },
      { header: 'Método Pago', key: 'metodoPago', width: 15 },
      { header: 'ID Transacción', key: 'transaccion', width: 25 },
      { header: 'Ref. PSE', key: 'pseRef', width: 20 },
      { header: 'Mensaje', key: 'mensaje', width: 40 },
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '667eea' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Agregar datos
    donaciones.forEach((donacion) => {
      const row = worksheet.addRow({
        id: donacion.id,
        fecha: new Date(donacion.createdAt), // Asegurar que sea un objeto Date válido
        tipo: this.formatearTipo(donacion.type),
        estado: this.formatearEstado(donacion.status),
        donante: donacion.donorName,
        email: donacion.donorEmail,
        telefono: donacion.donorPhone || '-',
        documento: donacion.donorDocument
          ? `${donacion.donorDocumentType} ${donacion.donorDocument}`
          : '-',
        monto: donacion.amount, // Guardar el valor original en centavos
        proyecto: donacion.projectName || 'Fondo General',
        metodoPago: this.formatearMetodoPago(donacion.paymentMethod),
        transaccion: donacion.transactionId,
        pseRef: donacion.pseReference || '-',
        mensaje: donacion.message || '-',
      });

      // Formatear fecha
      const fechaCell = row.getCell('fecha');
      fechaCell.numFmt = 'dd/mm/yyyy hh:mm';

      // Formatear monto como moneda (dividir entre 100 para convertir centavos a pesos)
      const montoCell = row.getCell('monto');
      montoCell.value = donacion.amount / 100;
      montoCell.numFmt = '"$"#,##0.00';

      // Color según estado
      const estadoCell = row.getCell('estado');
      switch (donacion.status) {
        case 'APPROVED':
          estadoCell.font = { color: { argb: '10b981' }, bold: true };
          break;
        case 'PENDING':
          estadoCell.font = { color: { argb: 'f59e0b' }, bold: true };
          break;
        case 'REJECTED':
          estadoCell.font = { color: { argb: 'ef4444' }, bold: true };
          break;
      }
    });

    // Agregar filtros
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length },
    };

    // Congelar primera fila
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Genera un reporte mensual o anual en Excel
   */
  async generarReporte(
    resumen: ReporteResumen,
    donaciones: Donation[],
    tipo: 'mensual' | 'anual',
  ): Promise<Buffer> {
    this.logger.log(`Generating ${tipo} report for ${resumen.periodo}`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fundación Huahuacuna';
    workbook.created = new Date();

    // Hoja 1: Resumen
    const resumenSheet = workbook.addWorksheet('Resumen', {
      properties: { tabColor: { argb: '10b981' } },
    });

    this.crearHojaResumen(resumenSheet, resumen, tipo);

    // Hoja 2: Donaciones Detalladas
    const detalleSheet = workbook.addWorksheet('Detalle', {
      properties: { tabColor: { argb: '667eea' } },
    });

    await this.agregarDonacionesAHoja(detalleSheet, donaciones);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private crearHojaResumen(
    worksheet: ExcelJS.Worksheet,
    resumen: ReporteResumen,
    tipo: 'mensual' | 'anual',
  ): void {
    // Título
    worksheet.mergeCells('A1:D1');
    const tituloCell = worksheet.getCell('A1');
    tituloCell.value = `REPORTE ${tipo.toUpperCase()} DE DONACIONES`;
    tituloCell.font = { size: 16, bold: true, color: { argb: '667eea' } };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Periodo
    worksheet.mergeCells('A2:D2');
    const periodoCell = worksheet.getCell('A2');
    periodoCell.value = `Periodo: ${resumen.periodo}`;
    periodoCell.font = { size: 12, bold: true };
    periodoCell.alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Métricas principales
    this.agregarMetrica(worksheet, 'Total de Donaciones', resumen.totalDonaciones);
    this.agregarMetrica(worksheet, 'Donaciones Monetarias', resumen.totalMonetarias);
    this.agregarMetrica(worksheet, 'Donaciones en Especie', resumen.totalEspecie);
    worksheet.addRow([]);

    this.agregarMetricaMoneda(worksheet, 'Monto Total', resumen.montoTotal);
    this.agregarMetricaMoneda(worksheet, 'Monto Aprobado', resumen.montoAprobado);
    this.agregarMetricaMoneda(worksheet, 'Monto Pendiente', resumen.montoPendiente);
    this.agregarMetricaMoneda(worksheet, 'Monto Rechazado', resumen.montoRechazado);
    worksheet.addRow([]);

    // Donaciones por estado
    worksheet.addRow(['DONACIONES POR ESTADO']).font = { bold: true, size: 12 };
    this.agregarMetrica(worksheet, 'Aprobadas', resumen.donacionesPorEstado.aprobadas);
    this.agregarMetrica(worksheet, 'Pendientes', resumen.donacionesPorEstado.pendientes);
    this.agregarMetrica(worksheet, 'Rechazadas', resumen.donacionesPorEstado.rechazadas);

    // Ajustar anchos
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 20;
  }

  private agregarMetrica(worksheet: ExcelJS.Worksheet, label: string, valor: number): void {
    const row = worksheet.addRow([label, valor]);
    row.getCell(1).font = { bold: true };
    row.getCell(2).alignment = { horizontal: 'right' };
  }

  private agregarMetricaMoneda(worksheet: ExcelJS.Worksheet, label: string, valor: number): void {
    const row = worksheet.addRow([label, valor / 100]);
    row.getCell(1).font = { bold: true };
    row.getCell(2).numFmt = '"$"#,##0.00';
    row.getCell(2).alignment = { horizontal: 'right' };
  }

  private async agregarDonacionesAHoja(
    worksheet: ExcelJS.Worksheet,
    donaciones: Donation[],
  ): Promise<void> {
    // Configurar columnas (igual que exportarDonaciones)
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Donante', key: 'donante', width: 30 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Proyecto', key: 'proyecto', width: 25 },
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '667eea' },
    };

    // Agregar datos
    donaciones.forEach((donacion) => {
      const row = worksheet.addRow({
        id: donacion.id,
        fecha: new Date(donacion.createdAt), // Asegurar que sea un objeto Date válido
        tipo: this.formatearTipo(donacion.type),
        estado: this.formatearEstado(donacion.status),
        donante: donacion.donorName,
        monto: donacion.amount, // Guardar el valor original en centavos
        proyecto: donacion.projectName || 'Fondo General',
      });

      row.getCell('fecha').numFmt = 'dd/mm/yyyy hh:mm';
      // Formatear monto como moneda (dividir entre 100 para convertir centavos a pesos)
      const montoCell = row.getCell('monto');
      montoCell.value = donacion.amount / 100;
      montoCell.numFmt = '"$"#,##0.00';
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length },
    };
  }

  private formatearTipo(tipo: string): string {
    const tipos: Record<string, string> = {
      MONETARY: 'Monetaria',
      IN_KIND: 'En Especie',
    };
    return tipos[tipo] || tipo;
  }

  private formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
      CANCELLED: 'Cancelada',
    };
    return estados[estado] || estado;
  }

  private formatearMetodoPago(metodo: string): string {
    const metodos: Record<string, string> = {
      PSE: 'PSE',
      BANK_TRANSFER: 'Transferencia',
      CASH: 'Efectivo',
      IN_KIND: 'En Especie',
    };
    return metodos[metodo] || metodo;
  }
}
