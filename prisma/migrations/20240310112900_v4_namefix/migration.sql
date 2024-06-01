/*
  Warnings:

  - You are about to drop the `Bomb` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bomb" DROP CONSTRAINT "Bomb_roomId_fkey";

-- DropTable
DROP TABLE "Bomb";

-- CreateTable
CREATE TABLE "Cell" (
    "id" SERIAL NOT NULL,
    "isBomb" BOOLEAN NOT NULL,
    "amount" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
