-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- CreateTable
CREATE TABLE "sub_produtos" (
    "n_Idsubproduto" SERIAL NOT NULL,
    "t_descricao" TEXT,
    "t_preco" DOUBLE PRECISION,
    "n_Idproduto" INTEGER NOT NULL,

    CONSTRAINT "sub_produtos_pkey" PRIMARY KEY ("n_Idsubproduto")
);

-- AddForeignKey
ALTER TABLE "sub_produtos" ADD CONSTRAINT "sub_produtos_n_Idproduto_fkey" FOREIGN KEY ("n_Idproduto") REFERENCES "produtos"("n_Idproduto") ON DELETE CASCADE ON UPDATE CASCADE;
