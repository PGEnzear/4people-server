/*
  Warnings:

  - You are about to drop the column `stepQueue` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "queue" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stepQueue" INTEGER[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stepQueue";
