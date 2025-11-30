-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profilePhoto" TEXT;
