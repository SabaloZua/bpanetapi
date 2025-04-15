-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- CreateTable
CREATE TABLE "depositoAPrazo" (
    "id" SERIAL NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "jurosBrutos" DECIMAL(15,2) NOT NULL,
    "jurosLiquidos" DECIMAL(15,2) NOT NULL,
    "n_Idconta" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "moeda" TEXT NOT NULL DEFAULT 'AOA',
    "parametroDepositoId" INTEGER NOT NULL,

    CONSTRAINT "depositoAPrazo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParametroDeposito" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "prazo" INTEGER NOT NULL,
    "tanb" DECIMAL(5,2) NOT NULL,
    "montanteMin" DECIMAL(15,2) NOT NULL,
    "montanteMax" DECIMAL(15,2) NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'AOA',

    CONSTRAINT "ParametroDeposito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "depositoAPrazo_dataVencimento_idx" ON "depositoAPrazo"("dataVencimento");

-- CreateIndex
CREATE INDEX "depositoAPrazo_status_idx" ON "depositoAPrazo"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ParametroDeposito_nome_key" ON "ParametroDeposito"("nome");

-- AddForeignKey
ALTER TABLE "depositoAPrazo" ADD CONSTRAINT "depositoAPrazo_parametroDepositoId_fkey" FOREIGN KEY ("parametroDepositoId") REFERENCES "ParametroDeposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depositoAPrazo" ADD CONSTRAINT "depositoAPrazo_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE CASCADE ON UPDATE CASCADE;
