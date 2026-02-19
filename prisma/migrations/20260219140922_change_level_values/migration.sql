/*
  Warnings:

  - The values [Pre_School,Lower_Primary,Upper_Primary,Junior_High_School] on the enum `Level` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Level_new" AS ENUM ('PRE_SCHOOL', 'LOWER_PRIMARY', 'UPPER_PRIMARY', 'JUNIOR_HIGH_SCHOOL');
ALTER TABLE "Class" ALTER COLUMN "level" TYPE "Level_new" USING ("level"::text::"Level_new");
ALTER TABLE "Subject" ALTER COLUMN "level" TYPE "Level_new" USING ("level"::text::"Level_new");
ALTER TYPE "Level" RENAME TO "Level_old";
ALTER TYPE "Level_new" RENAME TO "Level";
DROP TYPE "public"."Level_old";
COMMIT;
