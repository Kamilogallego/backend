import { DonationType, PaymentMethod, DonationStatus } from '@prisma/client';

export class Donation {
  id: number;
  type: DonationType;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  amount: number;
  currency: string;
  donorUserId?: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorDocumentType?: string;
  donorDocument?: string;
  donorAddress?: string;
  projectId?: number;
  projectName?: string;
  transactionId: string;
  pseReference?: string;
  pseApprovalCode?: string;
  pseTransactionDate?: Date;
  inKindDescription?: string;
  inKindEstimatedValue?: number;
  message?: string;
  isAnonymous: boolean;
  certificateGenerated: boolean;
  certificateUrl?: string;
  certificateNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: number;

  constructor(partial: Partial<Donation>) {
    Object.assign(this, partial);
  }

  isApproved(): boolean {
    return this.status === DonationStatus.APPROVED;
  }

  canGenerateCertificate(): boolean {
    return this.isApproved() && this.amount >= 5000000 && !this.certificateGenerated;
  }

  getAmountInPesos(): number {
    return this.amount / 100;
  }
}
