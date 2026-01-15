-- DropForeignKey
ALTER TABLE "WorkerPayments" DROP CONSTRAINT "WorkerPayments_paidByEngineerId_fkey";

-- AlterTable
ALTER TABLE "WorkerPayments" ALTER COLUMN "paidByEngineerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkerPayments" ADD CONSTRAINT "WorkerPayments_paidByEngineerId_fkey" FOREIGN KEY ("paidByEngineerId") REFERENCES "SiteEngineers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
