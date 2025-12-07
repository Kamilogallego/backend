export class DonationInfo {
  id: number;
  title: string;
  description: string;
  importance: string;
  destination: string;
  modalities: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  totalDonationsCount: number;
  totalAmount: number;
  beneficiariesCount: number;
  neededItems: string[];
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  scheduleInfo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: number;

  constructor(partial: Partial<DonationInfo>) {
    Object.assign(this, partial);
  }

  getTotalAmountInPesos(): number {
    return this.totalAmount / 100;
  }

  isPublished(): boolean {
    return this.isActive;
  }
}
