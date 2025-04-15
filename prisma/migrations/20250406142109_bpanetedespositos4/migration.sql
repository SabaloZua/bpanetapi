/*
  Warnings:

  - You are about to drop the column `n_parametroDepositoId` on the `deposito_prazo` table. All the data in the column will be lost.
  - The primary key for the `tipo_deposito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `n_idparametro` on the `tipo_deposito` table. All the data in the column will be lost.
  - Added the required column `n_idtipodeposito` to the `deposito_prazo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deposito_prazo" DROP CONSTRAINT "deposito_prazo_n_parametroDepositoId_fkey";

-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "deposito_prazo" DROP COLUMN "n_parametroDepositoId",
ADD COLUMN     "n_idtipodeposito" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tipo_deposito" DROP CONSTRAINT "tipo_deposito_pkey",
DROP COLUMN "n_idparametro",
ADD COLUMN     "n_idtipodeposito" SERIAL NOT NULL,
ADD CONSTRAINT "tipo_deposito_pkey" PRIMARY KEY ("n_idtipodeposito");

-- AddForeignKey
ALTER TABLE "deposito_prazo" ADD CONSTRAINT "deposito_prazo_n_idtipodeposito_fkey" FOREIGN KEY ("n_idtipodeposito") REFERENCES "tipo_deposito"("n_idtipodeposito") ON DELETE RESTRICT ON UPDATE CASCADE;
