/*
  Warnings:

  - You are about to drop the column `academicYear` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[level,grade,section]` on the table `Class` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropIndex
DROP INDEX "Class_academicYear_idx";

-- DropIndex
DROP INDEX "Class_level_grade_section_academicYear_key";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "academicYear";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "classId";

-- CreateIndex
CREATE UNIQUE INDEX "Class_level_grade_section_key" ON "Class"("level", "grade", "section");
