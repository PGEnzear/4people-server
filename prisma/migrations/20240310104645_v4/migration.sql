/*
  Warnings:

  - You are about to drop the column `bomb` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `bombHistory` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "bomb",
DROP COLUMN "bombHistory";

-- CreateTable
CREATE TABLE "Bomb" (
    "id" SERIAL NOT NULL,
    "isBomb" BOOLEAN NOT NULL,
    "amount" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bomb_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bomb" ADD CONSTRAINT "Bomb_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
