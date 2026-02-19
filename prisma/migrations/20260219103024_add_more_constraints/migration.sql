/*
  Warnings:

  - The `section` column on the `Class` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[section]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `level` on the `Class` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Pre_School', 'Lower_Primary', 'Upper_Primary', 'Junior_High_School');

-- CreateEnum
CREATE TYPE "Section" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "level",
ADD COLUMN     "level" "Level" NOT NULL,
DROP COLUMN "section",
ADD COLUMN     "section" "Section" NOT NULL DEFAULT 'A',
ALTER COLUMN "capacity" SET DEFAULT 30;

-- CreateIndex
CREATE UNIQUE INDEX "Class_section_key" ON "Class"("section");
