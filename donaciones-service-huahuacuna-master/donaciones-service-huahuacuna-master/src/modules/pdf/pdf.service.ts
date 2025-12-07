import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { NumeroALetras } from './utils/numero-a-letras.util.js';

export interface CertificadoDonacionData {
  año: number;
  donorName: string;
  donorDocumentType: string;
  donorDocument: string;
  totalAmount: number; // En centavos
  fechaEmision: Date;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  private readonly FUNDACION_NIT = '801.005.003-0';
  private readonly FUNDACION_NOMBRE = 'FUNDACION HUAHUACUNA';
  private readonly CIUDAD = 'Armenia Q';

  /**
   * Genera un certificado de donación en formato PDF
   * Solo permite generar certificados para años anteriores al actual
   */
  async generarCertificadoDonacion(data: CertificadoDonacionData): Promise<Buffer> {
    this.logger.log(`Generating donation certificate for ${data.donorName} - Year ${data.año}`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 72, right: 72 },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Encabezado
        this.agregarEncabezado(doc);

        // Título
        doc.moveDown(2);
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('CERTIFICADO DE DONACIÓN', { align: 'center' });

        doc.moveDown(2);

        // Cuerpo del certificado
        const montoEnPesos = Math.floor(data.totalAmount / 100);
        const montoFormateado = this.formatearMoneda(montoEnPesos);
        const montoEnLetras = NumeroALetras.convertirCentavosAPesos(data.totalAmount);

        const textoCertificado = `En nuestra calidad de Representante legal y revisor fiscal de la ${this.FUNDACION_NOMBRE} nos permitimos certificar para efectos de declaración de renta que durante el año ${data.año} el Señor ${data.donorName} identificado con ${data.donorDocumentType} ${data.donorDocument} realizó donaciones mediante transferencia electrónica a esta fundación por valor de ${montoFormateado} (${montoEnLetras}).

Nuestra Fundación es una entidad sin ánimo de lucro sometida a vigilancia oficial del Estado, cuyo objeto social es atender a la población infantil en estado de vulnerabilidad.

Atendiendo a disposiciones legales y tributarias hemos cumplido con el deber de presentar la declaración de renta por el periodo ${data.año}, igualmente los ingresos que se han recibido por donaciones se han manejado en depósitos o inversiones en establecimientos financieros autorizados.

Además, certificamos que los excedentes de la fundación son reinvertidos en las actividades señaladas en los estatutos.`;

        doc.fontSize(11)
          .font('Helvetica')
          .text(textoCertificado, {
            align: 'justify',
            lineGap: 5,
          });

        doc.moveDown(2);

        // Fecha de emisión
        const fechaTexto = this.formatearFechaEmision(data.fechaEmision);
        doc.fontSize(11)
          .text(`El presente certificado se firma en ${this.CIUDAD}, ${fechaTexto}.`, {
            align: 'justify',
          });

        doc.moveDown(4);

        // Firmas
        this.agregarFirmas(doc);

        // Footer
        this.agregarFooter(doc);

        doc.end();
      } catch (error) {
        this.logger.error(`Error generating certificate: ${error.message}`, error.stack);
        reject(error);
      }
    });
  }

  private agregarEncabezado(doc: PDFKit.PDFDocument): void {
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text(this.FUNDACION_NOMBRE, { align: 'center' });

    doc.fontSize(10)
      .font('Helvetica')
      .text(`NIT: ${this.FUNDACION_NIT}`, { align: 'center' });

    doc.moveDown(0.5);

    // Línea decorativa
    doc.moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
  }

  private agregarFirmas(doc: PDFKit.PDFDocument): void {
    const firmaY = doc.y;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const firmaWidth = pageWidth / 2 - 20;

    // Firma Representante Legal
    doc.fontSize(9)
      .font('Helvetica')
      .text('_________________________', doc.page.margins.left, firmaY, {
        width: firmaWidth,
        align: 'center',
      });

    doc.moveDown(0.3);
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('Representante Legal', doc.page.margins.left, doc.y, {
        width: firmaWidth,
        align: 'center',
      });

    // Firma Revisor Fiscal
    const firmaDerechaX = doc.page.margins.left + firmaWidth + 40;
    doc.fontSize(9)
      .font('Helvetica')
      .text('_________________________', firmaDerechaX, firmaY, {
        width: firmaWidth,
        align: 'center',
      });

    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('Revisor Fiscal', firmaDerechaX, firmaY + 20, {
        width: firmaWidth,
        align: 'center',
      });
  }

  private agregarFooter(doc: PDFKit.PDFDocument): void {
    const bottomY = doc.page.height - doc.page.margins.bottom - 30;

    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#666666')
      .text(
        `${this.FUNDACION_NOMBRE} - NIT: ${this.FUNDACION_NIT}`,
        doc.page.margins.left,
        bottomY,
        {
          align: 'center',
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        },
      );
  }

  private formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  }

  private formatearFechaEmision(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    const diaEnLetras = NumeroALetras.convertir(dia).toLowerCase();

    return `a los ${diaEnLetras} (${dia}) días del mes de ${mes} de ${año}`;
  }
}
