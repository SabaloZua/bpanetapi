/*
  Warnings:

  - You are about to drop the column `n_Iban` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the column `n_Nba` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the column `n_numeroconta` on the `conta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cartao" ALTER COLUMN "n_numero" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "conta" DROP COLUMN "n_Iban",
DROP COLUMN "n_Nba",
DROP COLUMN "n_numeroconta",
ADD COLUMN     "t_Iban" TEXT,
ADD COLUMN     "t_Nba" TEXT,
ADD COLUMN     "t_numeroconta" TEXT,
ALTER COLUMN "n_saldo" SET DATA TYPE DOUBLE PRECISION;
