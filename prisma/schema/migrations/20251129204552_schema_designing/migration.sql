-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CHIEF_ENGINEER', 'SITE_ENGINEER', 'WORKER');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('DUE', 'PAID', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "WorkerPosition" AS ENUM ('SENIOR_TECHNICIAN', 'JUNIOR_TECHNICIAN', 'SENIOR_HELPER', 'JUNIOR_HELPER', 'ELECTRICIAN', 'PLUMBER', 'CARPENTER', 'OTHER');

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DOUBLE PRECISION,
    "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerPayment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalAmountDue" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'DUE',
    "paidByEngineerId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteEngineerSalary" (
    "id" TEXT NOT NULL,
    "engineerId" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "salaryMonth" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteEngineerSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiefEngineerSalary" (
    "id" TEXT NOT NULL,
    "chiefEngineerId" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "salaryMonth" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiefEngineerSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'WORKER',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "gender" "Gender",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SITE_Engineer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "contactNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SITE_Engineer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "contactNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nidNumber" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "onleave" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyRate" DOUBLE PRECISION,
    "halfDayRate" DOUBLE PRECISION,
    "position" "WorkerPosition",

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CHIEF_ENGINEER" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CHIEF_ENGINEER_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "totalCost" DOUBLE PRECISION,
    "status" "SiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkAssignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "siteId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "workdate" TIMESTAMP(3),
    "assignedByEngineerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SITE_Engineer_email_key" ON "SITE_Engineer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SITE_Engineer_userId_key" ON "SITE_Engineer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_email_key" ON "Worker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_nidNumber_key" ON "Worker"("nidNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CHIEF_ENGINEER_email_key" ON "CHIEF_ENGINEER"("email");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerPayment" ADD CONSTRAINT "WorkerPayment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerPayment" ADD CONSTRAINT "WorkerPayment_paidByEngineerId_fkey" FOREIGN KEY ("paidByEngineerId") REFERENCES "SITE_Engineer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteEngineerSalary" ADD CONSTRAINT "SiteEngineerSalary_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "SITE_Engineer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiefEngineerSalary" ADD CONSTRAINT "ChiefEngineerSalary_chiefEngineerId_fkey" FOREIGN KEY ("chiefEngineerId") REFERENCES "CHIEF_ENGINEER"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SITE_Engineer" ADD CONSTRAINT "SITE_Engineer_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CHIEF_ENGINEER" ADD CONSTRAINT "CHIEF_ENGINEER_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAssignment" ADD CONSTRAINT "WorkAssignment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAssignment" ADD CONSTRAINT "WorkAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkAssignment" ADD CONSTRAINT "WorkAssignment_assignedByEngineerId_fkey" FOREIGN KEY ("assignedByEngineerId") REFERENCES "SITE_Engineer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
