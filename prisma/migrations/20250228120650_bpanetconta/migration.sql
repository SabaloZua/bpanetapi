/*
  Warnings:

  - You are about to drop the column `n_contadestino` on the `trasacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trasacao" DROP COLUMN "n_contadestino",
ADD COLUMN     "t_contadestino" TEXT;
