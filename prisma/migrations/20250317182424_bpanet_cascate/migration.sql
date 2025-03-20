-- DropForeignKey
ALTER TABLE "LevantamentoSemCartao" DROP CONSTRAINT "LevantamentoSemCartao_n_Idconta_fkey";

-- DropForeignKey
ALTER TABLE "cartao" DROP CONSTRAINT "cartao_n_Idconta_fkey";

-- DropForeignKey
ALTER TABLE "client_email" DROP CONSTRAINT "fk_user_id";

-- DropForeignKey
ALTER TABLE "conta" DROP CONSTRAINT "conta_n_Idcliente_fkey";

-- DropForeignKey
ALTER TABLE "dispositivo" DROP CONSTRAINT "dispositivo_n_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "perguntaSeguranca" DROP CONSTRAINT "perguntaSeguranca_n_Idconta_fkey";

-- DropForeignKey
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_n_Idconta_fkey";

-- AddForeignKey
ALTER TABLE "cartao" ADD CONSTRAINT "cartao_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_email" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conta" ADD CONSTRAINT "conta_n_Idcliente_fkey" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivo" ADD CONSTRAINT "dispositivo_n_id_usuario_fkey" FOREIGN KEY ("n_id_usuario") REFERENCES "usuario"("n_id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perguntaSeguranca" ADD CONSTRAINT "perguntaSeguranca_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevantamentoSemCartao" ADD CONSTRAINT "LevantamentoSemCartao_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE CASCADE ON UPDATE CASCADE;
