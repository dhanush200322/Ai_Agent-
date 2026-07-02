-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "developerApplicationId" UUID,
ADD COLUMN     "ownerType" TEXT NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN     "permissionsJson" JSONB,
ADD COLUMN     "quota" INTEGER,
ADD COLUMN     "rateLimit" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'INTERNAL';
