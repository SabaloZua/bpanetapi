-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "perguntaSeguranca" ADD COLUMN     "n_tentativas" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "n_tentativas" INTEGER DEFAULT 0;
