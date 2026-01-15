/*
  Warnings:

  - The `attendanceIds` column on the `WorkerPayments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WorkerPayments" DROP COLUMN "attendanceIds",
ADD COLUMN     "attendanceIds" TEXT[];
