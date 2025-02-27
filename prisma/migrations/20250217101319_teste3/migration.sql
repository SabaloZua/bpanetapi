-- AlterTable
CREATE SEQUENCE cartao_n_idcartao_seq;
ALTER TABLE "cartao" ADD COLUMN     "n_numero" INTEGER,
ALTER COLUMN "n_Idcartao" SET DEFAULT nextval('cartao_n_idcartao_seq');
ALTER SEQUENCE cartao_n_idcartao_seq OWNED BY "cartao"."n_Idcartao";

-- AlterTable
CREATE SEQUENCE conta_n_idconta_seq;
ALTER TABLE "conta" ADD COLUMN     "n_numeroconta" INTEGER,
ALTER COLUMN "n_Idconta" SET DEFAULT nextval('conta_n_idconta_seq');
ALTER SEQUENCE conta_n_idconta_seq OWNED BY "conta"."n_Idconta";
