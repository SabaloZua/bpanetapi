-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "t_primeiroLogin" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "perguntaSeguranca" (
    "n_Idpergunta" SERIAL NOT NULL,
    "t_pergunta" TEXT,
    "t_resposta" TEXT,
    "n_Idconta" INTEGER NOT NULL,

    CONSTRAINT "perguntaSeguranca_pkey" PRIMARY KEY ("n_Idpergunta")
);

-- AddForeignKey
ALTER TABLE "perguntaSeguranca" ADD CONSTRAINT "perguntaSeguranca_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE NO ACTION ON UPDATE NO ACTION;
