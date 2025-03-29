-- DropForeignKey
ALTER TABLE "Produtos" DROP CONSTRAINT "Produtos_n_Identidade_fkey";

-- AddForeignKey
ALTER TABLE "Produtos" ADD CONSTRAINT "Produtos_n_Identidade_fkey" FOREIGN KEY ("n_Identidade") REFERENCES "Entidade"("n_Identidade") ON DELETE CASCADE ON UPDATE CASCADE;
