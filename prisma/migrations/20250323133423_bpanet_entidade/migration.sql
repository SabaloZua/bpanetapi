-- CreateTable
CREATE TABLE "Entidade" (
    "n_Identidade" SERIAL NOT NULL,
    "t_referencia" TEXT,
    "t_nome" TEXT,
    "logo" TEXT,

    CONSTRAINT "Entidade_pkey" PRIMARY KEY ("n_Identidade")
);

-- CreateTable
CREATE TABLE "Produtos" (
    "n_Idproduto" SERIAL NOT NULL,
    "t_descricao" TEXT,
    "t_preco" DOUBLE PRECISION,
    "n_Identidade" INTEGER NOT NULL,

    CONSTRAINT "Produtos_pkey" PRIMARY KEY ("n_Idproduto")
);

-- AddForeignKey
ALTER TABLE "Produtos" ADD CONSTRAINT "Produtos_n_Identidade_fkey" FOREIGN KEY ("n_Identidade") REFERENCES "Entidade"("n_Identidade") ON DELETE NO ACTION ON UPDATE NO ACTION;
