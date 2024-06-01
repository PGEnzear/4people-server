/*
  Warnings:

  - You are about to drop the column `telegramId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_telegramId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegramId",
ADD COLUMN     "chatId" BIGINT NOT NULL,
ADD COLUMN     "stepQueue" INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "User_chatId_key" ON "User"("chatId");
