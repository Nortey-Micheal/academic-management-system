/*
  Warnings:

  - You are about to drop the column `className` on the `Class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[level,grade,section,academicYear]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grade` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Class_section_key";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "className",
ADD COLUMN     "grade" INTEGER NOT NULL,
ALTER COLUMN "currentEnrollment" SET DEFAULT 0,
ALTER COLUMN "section" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Class_academicYear_idx" ON "Class"("academicYear");

-- CreateIndex
CREATE INDEX "Class_level_grade_idx" ON "Class"("level", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "Class_level_grade_section_academicYear_key" ON "Class"("level", "grade", "section", "academicYear");
