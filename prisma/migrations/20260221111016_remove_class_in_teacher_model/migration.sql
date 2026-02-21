/*
  Warnings:

  - You are about to drop the `_TeacherClasses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TeacherClasses" DROP CONSTRAINT "_TeacherClasses_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeacherClasses" DROP CONSTRAINT "_TeacherClasses_B_fkey";

-- DropTable
DROP TABLE "_TeacherClasses";
