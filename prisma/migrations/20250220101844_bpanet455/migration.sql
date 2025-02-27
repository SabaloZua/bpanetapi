/*
  Warnings:

  - You are about to drop the column `n_numero` on the `cartao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cartao" DROP COLUMN "n_numero",
ADD COLUMN     "t_numero" TEXT;
