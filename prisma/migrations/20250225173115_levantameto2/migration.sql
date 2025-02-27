/*
  Warnings:

  - Added the required column `t_referencia` to the `LevantamentoSemCartao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ADD COLUMN     "t_referencia" VARCHAR NOT NULL;
