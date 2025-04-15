/*
  Warnings:

  - You are about to alter the column `n_tanb` on the `tipo_deposito` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Integer`.
  - You are about to alter the column `n_montanteMin` on the `tipo_deposito` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Integer`.
  - You are about to alter the column `n_montanteMax` on the `tipo_deposito` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "tipo_deposito" ALTER COLUMN "n_tanb" SET DATA TYPE INTEGER,
ALTER COLUMN "n_montanteMin" SET DATA TYPE INTEGER,
ALTER COLUMN "n_montanteMax" SET DATA TYPE INTEGER;
