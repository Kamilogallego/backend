import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module.js';
import { DonationsRepository } from './infrastructure/persistence/donations.repository.js';
import { DonationInfoRepository } from './infrastructure/persistence/donation-info.repository.js';
import { DonorTestimonialRepository } from './infrastructure/persistence/donor-testimonial.repository.js';
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
} from './application/use-cases/index.js';
import { DonationsKafkaController } from './presentation/controllers/donations.kafka.controller.js';
import {
  DONATIONS_REPOSITORY,
  DONATION_INFO_REPOSITORY,
  DONOR_TESTIMONIAL_REPOSITORY,
} from './donations.constants.js';
import { EmailModule } from '../email/email.module.js';
import { PseModule } from '../pse/pse.module.js';
import { PdfModule } from '../pdf/pdf.module.js';
import { ExcelModule } from '../excel/excel.module.js';

@Module({
  imports: [DatabaseModule, EmailModule, PseModule, PdfModule, ExcelModule],
  controllers: [DonationsKafkaController],
  providers: [
    // Repositories
    {
      provide: DONATIONS_REPOSITORY,
      useClass: DonationsRepository,
    },
    {
      provide: DONATION_INFO_REPOSITORY,
      useClass: DonationInfoRepository,
    },
    {
      provide: DONOR_TESTIMONIAL_REPOSITORY,
      useClass: DonorTestimonialRepository,
    },
    // Use Cases - Donations
    CreateMonetaryDonationUseCase,
    CreateInKindDonationUseCase,
    GetAllDonationsUseCase,
    GetUserDonationsUseCase,
    ApproveDonationUseCase,
    // Use Cases - Donation Info
    GetDonationInfoUseCase,
    ManageDonationInfoUseCase,
    // Use Cases - Testimonials
    GetPublishedTestimonialsUseCase,
    ManageTestimonialsUseCase,
    // Use Cases - PSE
    ProcessPseCallbackUseCase,
    // Use Cases - Certificates
    GenerateAnnualCertificateUseCase,
    // Use Cases - Excel Reports
    ExportDonationsUseCase,
    GenerateDonationsReportUseCase,
  ],
  exports: [],
})
export class DonationsModule {}
