/*
  Warnings:

  - You are about to drop the column `n_saldoactual` on the `trasacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trasacao" DROP COLUMN "n_saldoactual",
ADD COLUMN     "t_saldoactual" TEXT;
