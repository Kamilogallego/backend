import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateMonetaryDonationUseCase,
  CreateInKindDonationUseCase,
  GetAllDonationsUseCase,
  GetUserDonationsUseCase,
  ApproveDonationUseCase,
  GetDonationInfoUseCase,
  GetPublishedTestimonialsUseCase,
  ManageDonationInfoUseCase,
  ManageTestimonialsUseCase,
  ProcessPseCallbackUseCase,
  GenerateAnnualCertificateUseCase,
  ExportDonationsUseCase,
  GenerateDonationsReportUseCase,
} from '../../application/use-cases/index.js';
import {
  CreateMonetaryDonationDto,
  CreateInKindDonationDto,
  GetDonationsQueryDto,
  CreateDonationInfoDto,
  UpdateDonationInfoDto,
  CreateTestimonialDto,
  UpdateTestimonialDto,
  ExportDonationsDto,
  GenerateReportDto,
} from '../dto/index.js';

@Controller()
export class DonationsKafkaController {
  private readonly logger = new Logger(DonationsKafkaController.name);

  constructor(
    private readonly createMonetaryDonationUseCase: CreateMonetaryDonationUseCase,
    private readonly createInKindDonationUseCase: CreateInKindDonationUseCase,
    private readonly getAllDonationsUseCase: GetAllDonationsUseCase,
    private readonly getUserDonationsUseCase: GetUserDonationsUseCase,
    private readonly approveDonationUseCase: ApproveDonationUseCase,
    private readonly getDonationInfoUseCase: GetDonationInfoUseCase,
    private readonly getPublishedTestimonialsUseCase: GetPublishedTestimonialsUseCase,
    private readonly manageDonationInfoUseCase: ManageDonationInfoUseCase,
    private readonly manageTestimonialsUseCase: ManageTestimonialsUseCase,
    private readonly processPseCallbackUseCase: ProcessPseCallbackUseCase,
    private readonly generateAnnualCertificateUseCase: GenerateAnnualCertificateUseCase,
    private readonly exportDonationsUseCase: ExportDonationsUseCase,
    private readonly generateDonationsReportUseCase: GenerateDonationsReportUseCase,
  ) {}

  @MessagePattern('donaciones_create_monetary')
  async createMonetary(@Payload() payload: CreateMonetaryDonationDto) {
    this.logger.log('Received create_monetary message');
    try {
      return await this.createMonetaryDonationUseCase.execute(payload);
    } catch (error) {
      this.logger.error('Error creating monetary donation', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_create_inkind')
  async createInKind(@Payload() payload: CreateInKindDonationDto) {
    this.logger.log('Received create_inkind message');
    try {
      return await this.createInKindDonationUseCase.execute(payload);
    } catch (error) {
      this.logger.error('Error creating in-kind donation', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_get_all')
  async getAll(@Payload() payload: GetDonationsQueryDto) {
    this.logger.log('Received get_all message');
    try {
      return await this.getAllDonationsUseCase.execute(payload);
    } catch (error) {
      this.logger.error('Error getting donations', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_get_user_donations')
  async getUserDonations(@Payload() payload: { userId: number; skip?: number; take?: number }) {
    this.logger.log('Received get_user_donations message');
    try {
      return await this.getUserDonationsUseCase.execute(payload.userId, {
        skip: payload.skip,
        take: payload.take,
      });
    } catch (error) {
      this.logger.error('Error getting user donations', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_approve')
  async approve(@Payload() payload: { id: number; approvedBy?: number }) {
    this.logger.log('Received approve message');
    try {
      return await this.approveDonationUseCase.execute(payload.id, payload.approvedBy);
    } catch (error) {
      this.logger.error('Error approving donation', error);
      throw error;
    }
  }

  // ============================================================================
  // DONATION INFO ENDPOINTS
  // ============================================================================

  @MessagePattern('donaciones_get_donation_info')
  async getDonationInfo() {
    this.logger.log('Received get_donation_info message');
    try {
      return await this.getDonationInfoUseCase.execute();
    } catch (error) {
      this.logger.error('Error getting donation info', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_create_donation_info')
  async createDonationInfo(@Payload() payload: CreateDonationInfoDto) {
    this.logger.log('Received create_donation_info message');
    try {
      return await this.manageDonationInfoUseCase.create(payload);
    } catch (error) {
      this.logger.error('Error creating donation info', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_update_donation_info')
  async updateDonationInfo(@Payload() payload: UpdateDonationInfoDto & { id: number }) {
    this.logger.log('Received update_donation_info message');
    try {
      return await this.manageDonationInfoUseCase.update(payload);
    } catch (error) {
      this.logger.error('Error updating donation info', error);
      throw error;
    }
  }

  // ============================================================================
  // TESTIMONIALS ENDPOINTS
  // ============================================================================

  @MessagePattern('donaciones_get_published_testimonials')
  async getPublishedTestimonials(@Payload() payload?: { limit?: number }) {
    this.logger.log('Received get_published_testimonials message');
    try {
      return await this.getPublishedTestimonialsUseCase.execute(payload?.limit);
    } catch (error) {
      this.logger.error('Error getting published testimonials', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_get_all_testimonials')
  async getAllTestimonials(@Payload() payload?: { skip?: number; take?: number }) {
    this.logger.log('Received get_all_testimonials message');
    try {
      return await this.manageTestimonialsUseCase.getAll(payload);
    } catch (error) {
      this.logger.error('Error getting all testimonials', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_create_testimonial')
  async createTestimonial(@Payload() payload: CreateTestimonialDto) {
    this.logger.log('Received create_testimonial message');
    try {
      return await this.manageTestimonialsUseCase.create(payload);
    } catch (error) {
      this.logger.error('Error creating testimonial', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_update_testimonial')
  async updateTestimonial(@Payload() payload: UpdateTestimonialDto & { id: number }) {
    this.logger.log('Received update_testimonial message');
    try {
      return await this.manageTestimonialsUseCase.update(payload);
    } catch (error) {
      this.logger.error('Error updating testimonial', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_publish_testimonial')
  async publishTestimonial(@Payload() payload: { id: number }) {
    this.logger.log('Received publish_testimonial message');
    try {
      return await this.manageTestimonialsUseCase.publish(payload.id);
    } catch (error) {
      this.logger.error('Error publishing testimonial', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_unpublish_testimonial')
  async unpublishTestimonial(@Payload() payload: { id: number }) {
    this.logger.log('Received unpublish_testimonial message');
    try {
      return await this.manageTestimonialsUseCase.unpublish(payload.id);
    } catch (error) {
      this.logger.error('Error unpublishing testimonial', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_delete_testimonial')
  async deleteTestimonial(@Payload() payload: { id: number }) {
    this.logger.log('Received delete_testimonial message');
    try {
      await this.manageTestimonialsUseCase.delete(payload.id);
      return { success: true, message: 'Testimonial deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting testimonial', error);
      throw error;
    }
  }

  // ============================================================================
  // PSE ENDPOINTS
  // ============================================================================

  @MessagePattern('donaciones_pse_callback')
  async pseCallback(@Payload() payload: any) {
    this.logger.log('Received PSE callback message');
    try {
      return await this.processPseCallbackUseCase.execute(payload);
    } catch (error) {
      this.logger.error('Error processing PSE callback', error);
      throw error;
    }
  }

  // ============================================================================
  // CERTIFICATES ENDPOINTS
  // ============================================================================

  @MessagePattern('donaciones_generate_certificate')
  async generateCertificate(@Payload() payload: { userId: number; year: number }) {
    this.logger.log(`Received generate_certificate message for user ${payload.userId}, year ${payload.year}`);
    try {
      const pdfBuffer = await this.generateAnnualCertificateUseCase.execute(payload);
      // Convertir Buffer a base64 para transmitir por Kafka
      return {
        pdf: pdfBuffer.toString('base64'),
        filename: `certificado-donacion-${payload.year}.pdf`,
      };
    } catch (error) {
      this.logger.error('Error generating certificate', error);
      // Propagar error con estructura completa para que el gateway pueda manejarlo
      throw {
        status: error.status || error.statusCode || 500,
        statusCode: error.status || error.statusCode || 500,
        message: error.message || 'Error al generar certificado',
        error: error.error || error.name || 'Error',
      };
    }
  }

  // ============================================================================
  // EXCEL EXPORTS & REPORTS ENDPOINTS
  // ============================================================================

  @MessagePattern('donaciones_export_excel')
  async exportExcel(@Payload() payload: ExportDonationsDto) {
    this.logger.log('Received export_excel message');
    try {
      const excelBuffer = await this.exportDonationsUseCase.execute(payload);
      return {
        excel: excelBuffer.toString('base64'),
        filename: `donaciones-${Date.now()}.xlsx`,
      };
    } catch (error) {
      this.logger.error('Error exporting to Excel', error);
      throw error;
    }
  }

  @MessagePattern('donaciones_generate_report')
  async generateReport(@Payload() payload: GenerateReportDto) {
    this.logger.log(`Received generate_report message - ${payload.type}`);
    try {
      const reportBuffer = await this.generateDonationsReportUseCase.execute(payload);
      const filename =
        payload.type === 'monthly'
          ? `reporte-${payload.year}-${payload.month}.xlsx`
          : `reporte-${payload.year}.xlsx`;

      return {
        excel: reportBuffer.toString('base64'),
        filename,
      };
    } catch (error) {
      this.logger.error('Error generating report', error);
      throw error;
    }
  }
}
