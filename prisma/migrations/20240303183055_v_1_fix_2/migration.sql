/*
  Warnings:

  - You are about to drop the column `active` on the `Room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('waiting', 'ingame', 'played');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "active",
ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'waiting';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
