/*
  Warnings:

  - Made the column `t_caminho` on table `images_cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "images_cliente" ALTER COLUMN "t_caminho" SET NOT NULL;
