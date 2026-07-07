-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ipAddress" TEXT,
    "browser" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAttachment" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactAttachment_submissionId_idx" ON "ContactAttachment"("submissionId");

-- AddForeignKey
ALTER TABLE "ContactAttachment" ADD CONSTRAINT "ContactAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ContactSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
