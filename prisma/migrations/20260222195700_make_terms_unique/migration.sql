/*
  Warnings:

  - A unique constraint covering the columns `[termNumber,academicYearId]` on the table `Term` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Term_termNumber_academicYearId_key" ON "Term"("termNumber", "academicYearId");
