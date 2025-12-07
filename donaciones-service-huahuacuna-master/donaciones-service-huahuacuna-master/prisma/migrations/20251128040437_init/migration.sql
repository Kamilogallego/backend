-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('MONETARY', 'IN_KIND');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PSE', 'BANK_TRANSFER', 'CASH', 'IN_KIND');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "donations" (
    "id" SERIAL NOT NULL,
    "type" "DonationType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "donorUserId" INTEGER,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorPhone" TEXT,
    "donorDocumentType" TEXT,
    "donorDocument" TEXT,
    "donorAddress" TEXT,
    "projectId" INTEGER,
    "projectName" TEXT,
    "transactionId" TEXT NOT NULL,
    "pseReference" TEXT,
    "pseApprovalCode" TEXT,
    "pseTransactionDate" TIMESTAMP(3),
    "inKindDescription" TEXT,
    "inKindEstimatedValue" INTEGER,
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "certificateGenerated" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    "certificateNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_info" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "modalities" TEXT NOT NULL,
    "ctaTitle" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "ctaButtonText" TEXT NOT NULL,
    "totalDonationsCount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "beneficiariesCount" INTEGER NOT NULL DEFAULT 0,
    "neededItems" TEXT[],
    "contactAddress" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "scheduleInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "donation_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donor_testimonials" (
    "id" SERIAL NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorPhoto" TEXT,
    "testimonial" TEXT NOT NULL,
    "donationAmount" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "donor_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pse_configuration" (
    "id" SERIAL NOT NULL,
    "merchantId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "returnUrl" TEXT NOT NULL,
    "minAmount" INTEGER NOT NULL DEFAULT 1000000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTestMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER NOT NULL,

    CONSTRAINT "pse_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_transactionId_key" ON "donations"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_certificateNumber_key" ON "donations"("certificateNumber");

-- CreateIndex
CREATE INDEX "donations_donorUserId_idx" ON "donations"("donorUserId");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_transactionId_idx" ON "donations"("transactionId");

-- CreateIndex
CREATE INDEX "donations_createdAt_idx" ON "donations"("createdAt");

-- CreateIndex
CREATE INDEX "donations_donorEmail_idx" ON "donations"("donorEmail");

-- CreateIndex
CREATE INDEX "donations_projectId_idx" ON "donations"("projectId");
