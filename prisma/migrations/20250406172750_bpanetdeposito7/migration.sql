-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "tipo_deposito" ADD COLUMN     "t_descricao" VARCHAR;
