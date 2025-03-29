/*
  Warnings:

  - You are about to drop the column `n_Idtipoconta` on the `conta` table. All the data in the column will be lost.
  - You are about to drop the `tipo_cota` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "conta" DROP CONSTRAINT "conta_n_Idtipoconta_fkey";

-- AlterTable
ALTER TABLE "conta" DROP COLUMN "n_Idtipoconta";

-- DropTable
DROP TABLE "tipo_cota";
