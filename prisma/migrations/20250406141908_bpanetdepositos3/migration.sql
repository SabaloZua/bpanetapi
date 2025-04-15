/*
  Warnings:

  - You are about to drop the `ParametroDeposito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `depositoAPrazo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "depositoAPrazo" DROP CONSTRAINT "depositoAPrazo_n_Idconta_fkey";

-- DropForeignKey
ALTER TABLE "depositoAPrazo" DROP CONSTRAINT "depositoAPrazo_n_parametroDepositoId_fkey";

-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- DropTable
DROP TABLE "ParametroDeposito";

-- DropTable
DROP TABLE "depositoAPrazo";

-- CreateTable
CREATE TABLE "deposito_prazo" (
    "n_iddeposito" SERIAL NOT NULL,
    "n_valor" DECIMAL(15,2) NOT NULL,
    "t_dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "t_dataVencimento" TIMESTAMP(3) NOT NULL,
    "n_jurosBrutos" DECIMAL(15,2) NOT NULL,
    "n_jurosLiquidos" DECIMAL(15,2) NOT NULL,
    "n_Idconta" INTEGER NOT NULL,
    "t_status" TEXT NOT NULL DEFAULT 'ATIVO',
    "n_parametroDepositoId" INTEGER NOT NULL,

    CONSTRAINT "deposito_prazo_pkey" PRIMARY KEY ("n_iddeposito")
);

-- CreateTable
CREATE TABLE "tipo_deposito" (
    "n_idparametro" SERIAL NOT NULL,
    "t_nome" TEXT NOT NULL,
    "n_prazo" INTEGER NOT NULL,
    "n_tanb" DECIMAL(5,2) NOT NULL,
    "n_montanteMin" DECIMAL(15,2) NOT NULL,
    "n_montanteMax" DECIMAL(15,2) NOT NULL,
    "t_moeda" TEXT NOT NULL DEFAULT 'AOA',

    CONSTRAINT "tipo_deposito_pkey" PRIMARY KEY ("n_idparametro")
);

-- CreateIndex
CREATE INDEX "deposito_prazo_t_dataVencimento_idx" ON "deposito_prazo"("t_dataVencimento");

-- CreateIndex
CREATE INDEX "deposito_prazo_t_status_idx" ON "deposito_prazo"("t_status");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_deposito_t_nome_key" ON "tipo_deposito"("t_nome");

-- AddForeignKey
ALTER TABLE "deposito_prazo" ADD CONSTRAINT "deposito_prazo_n_parametroDepositoId_fkey" FOREIGN KEY ("n_parametroDepositoId") REFERENCES "tipo_deposito"("n_idparametro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposito_prazo" ADD CONSTRAINT "deposito_prazo_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE CASCADE ON UPDATE CASCADE;
