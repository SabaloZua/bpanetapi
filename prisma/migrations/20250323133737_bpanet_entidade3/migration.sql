/*
  Warnings:

  - You are about to drop the `Entidade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Produtos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Produtos" DROP CONSTRAINT "Produtos_n_Identidade_fkey";

-- DropTable
DROP TABLE "Entidade";

-- DropTable
DROP TABLE "Produtos";

-- CreateTable
CREATE TABLE "entidade" (
    "n_Identidade" SERIAL NOT NULL,
    "t_referencia" TEXT,
    "t_nome" TEXT,
    "logo" TEXT,

    CONSTRAINT "entidade_pkey" PRIMARY KEY ("n_Identidade")
);

-- CreateTable
CREATE TABLE "produtos" (
    "n_Idproduto" SERIAL NOT NULL,
    "t_descricao" TEXT,
    "t_preco" DOUBLE PRECISION,
    "n_Identidade" INTEGER NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("n_Idproduto")
);

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_n_Identidade_fkey" FOREIGN KEY ("n_Identidade") REFERENCES "entidade"("n_Identidade") ON DELETE CASCADE ON UPDATE CASCADE;
