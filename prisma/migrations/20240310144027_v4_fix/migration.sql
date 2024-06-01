/*
  Warnings:

  - Added the required column `index` to the `Cell` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "index" INTEGER NOT NULL;
