/*
  Warnings:

  - Made the column `n_saldo` on table `conta` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "conta" ALTER COLUMN "n_saldo" SET NOT NULL,
ALTER COLUMN "n_saldo" SET DEFAULT 0;
