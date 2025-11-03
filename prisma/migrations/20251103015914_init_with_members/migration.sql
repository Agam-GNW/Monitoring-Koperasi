-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('HIGH', 'LOW');

-- CreateEnum
CREATE TYPE "public"."KoperasiType" AS ENUM ('SIMPAN_PINJAM', 'KONSUMSI', 'PRODUKSI', 'JASA', 'SERBA_USAHA');

-- CreateEnum
CREATE TYPE "public"."KoperasiStatus" AS ENUM ('PENDING', 'AKTIF_SEHAT', 'AKTIF_TIDAK_SEHAT', 'TIDAK_DISETUJUI');

-- CreateEnum
CREATE TYPE "public"."LegalStatus" AS ENUM ('LEGAL', 'PENDING_REVIEW', 'REJECTED', 'NOT_SUBMITTED');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('MEETING', 'TRAINING', 'AUDIT', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'LOW',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."koperasi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."KoperasiType" NOT NULL,
    "status" "public"."KoperasiStatus" NOT NULL DEFAULT 'PENDING',
    "legalStatus" "public"."LegalStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "description" TEXT,
    "submissionDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "koperasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nik" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "placeOfBirth" TEXT,
    "gender" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "koperasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "location" TEXT,
    "koperasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDate" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "koperasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "koperasi_ownerId_key" ON "public"."koperasi"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "members_nik_key" ON "public"."members"("nik");

-- AddForeignKey
ALTER TABLE "public"."koperasi" ADD CONSTRAINT "koperasi_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."members" ADD CONSTRAINT "members_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "public"."koperasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "public"."koperasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "public"."koperasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
