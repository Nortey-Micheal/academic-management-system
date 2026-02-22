/*
  Warnings:

  - You are about to drop the column `createAt` on the `AcademicYear` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Term` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AcademicYear" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Term" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
