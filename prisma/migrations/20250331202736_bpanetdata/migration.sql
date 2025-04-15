-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';
