-- CreateTable
CREATE TABLE "LevantamentoSemCartao" (
    "n_Idlevantamento" SERIAL NOT NULL,
    "n_Idconta" INTEGER NOT NULL,
    "n_valor" INTEGER NOT NULL,
    "t_pin" VARCHAR(10) NOT NULL,
    "t_estado" TEXT NOT NULL DEFAULT 'pendente',
    "t_data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "t_data_expiracao" TIMESTAMP(3),

    CONSTRAINT "LevantamentoSemCartao_pkey" PRIMARY KEY ("n_Idlevantamento")
);

-- AddForeignKey
ALTER TABLE "LevantamentoSemCartao" ADD CONSTRAINT "LevantamentoSemCartao_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE NO ACTION ON UPDATE NO ACTION;
