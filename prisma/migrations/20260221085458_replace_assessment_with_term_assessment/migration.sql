/*
  Warnings:

  - You are about to drop the `Assessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_classId_fkey";

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_subjectCode_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_assessmentId_fkey";

-- DropTable
DROP TABLE "Assessment";

-- CreateTable
CREATE TABLE "TermAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "term" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "test1" INTEGER NOT NULL DEFAULT 0,
    "groupWork" INTEGER NOT NULL DEFAULT 0,
    "test2" INTEGER NOT NULL DEFAULT 0,
    "project" INTEGER NOT NULL DEFAULT 0,
    "exam" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TermAssessment_studentId_subjectId_term_year_key" ON "TermAssessment"("studentId", "subjectId", "term", "year");

-- AddForeignKey
ALTER TABLE "TermAssessment" ADD CONSTRAINT "TermAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermAssessment" ADD CONSTRAINT "TermAssessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermAssessment" ADD CONSTRAINT "TermAssessment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
