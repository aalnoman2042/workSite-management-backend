/*
  Warnings:

  - You are about to drop the column `userId` on the `Attendances` table. All the data in the column will be lost.
  - Added the required column `siteEngineerId` to the `Attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `Attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `Attendances` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- DropForeignKey
ALTER TABLE "Attendances" DROP CONSTRAINT "Attendances_userId_fkey";

-- AlterTable
ALTER TABLE "Attendances" DROP COLUMN "userId",
ADD COLUMN     "siteEngineerId" TEXT NOT NULL,
ADD COLUMN     "siteId" TEXT NOT NULL,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "workerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendances" ADD CONSTRAINT "Attendances_siteEngineerId_fkey" FOREIGN KEY ("siteEngineerId") REFERENCES "SiteEngineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
