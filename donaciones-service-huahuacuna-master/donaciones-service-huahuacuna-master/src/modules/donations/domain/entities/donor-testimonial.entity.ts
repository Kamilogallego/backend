export class DonorTestimonial {
  id: number;
  donorName: string;
  donorPhoto?: string;
  testimonial: string;
  donationAmount?: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;

  constructor(partial: Partial<DonorTestimonial>) {
    Object.assign(this, partial);
  }

  getDonationAmountInPesos(): number | null {
    return this.donationAmount ? this.donationAmount / 100 : null;
  }

  canBeDisplayed(): boolean {
    return this.isPublished && this.publishedAt !== null;
  }
}
