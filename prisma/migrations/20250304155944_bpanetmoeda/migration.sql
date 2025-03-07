/*
  Warnings:

  - You are about to drop the column `n_credito` on the `trasacao` table. All the data in the column will be lost.
  - You are about to drop the column `n_debito` on the `trasacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trasacao" DROP COLUMN "n_credito",
DROP COLUMN "n_debito",
ADD COLUMN     "t_credito" TEXT,
ADD COLUMN     "t_debito" TEXT;
