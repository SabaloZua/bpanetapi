-- CreateTable
CREATE TABLE "Telefone" (
    "n_id_telefone" SERIAL NOT NULL,
    "n_numero" INTEGER,
    "t_descricao" VARCHAR,
    "n_Idcliente" INTEGER NOT NULL,

    CONSTRAINT "Telefone_pkey" PRIMARY KEY ("n_id_telefone")
);

-- CreateTable
CREATE TABLE "cartao" (
    "n_Idcartao" INTEGER NOT NULL,
    "t_descricao" VARCHAR,
    "t_datavalidade" VARCHAR,
    "n_Idconta" INTEGER NOT NULL,

    CONSTRAINT "cartao_pkey" PRIMARY KEY ("n_Idcartao")
);

-- CreateTable
CREATE TABLE "cliente" (
    "n_Idcliente" SERIAL NOT NULL,
    "t_nomeclient" VARCHAR,
    "t_email" VARCHAR,
    "t_datanasci" VARCHAR,
    "n_adesao" INTEGER,
    "t_BI" VARCHAR,
    "t_password" TEXT,
    "t_ocupacao" VARCHAR,
    "n_Idmorada" INTEGER NOT NULL,
    "t_tolken" TEXT,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("n_Idcliente")
);

-- CreateTable
CREATE TABLE "conta" (
    "n_Idconta" INTEGER NOT NULL,
    "n_Iban" INTEGER,
    "n_Nba" INTEGER,
    "n_saldo" INTEGER,
    "t_estado" VARCHAR,
    "t_dataAbertura" VARCHAR,
    "n_Idcliente" INTEGER NOT NULL,
    "n_Idtipoconta" INTEGER NOT NULL,

    CONSTRAINT "conta_pkey" PRIMARY KEY ("n_Idconta")
);

-- CreateTable
CREATE TABLE "dispositivo" (
    "n_Iddispositivo" INTEGER NOT NULL,
    "n_IDusuarios" INTEGER NOT NULL,
    "t_sistemaoperativo" VARCHAR,
    "t_navegador" VARCHAR,

    CONSTRAINT "dispositivo_pkey" PRIMARY KEY ("n_Iddispositivo")
);

-- CreateTable
CREATE TABLE "images_cliente" (
    "n_idimagesn" SERIAL NOT NULL,
    "n_Idcliente" INTEGER NOT NULL,
    "t_descricao" VARCHAR,
    "t_caminho" TEXT,

    CONSTRAINT "images_cliente_pkey" PRIMARY KEY ("n_idimagesn")
);

-- CreateTable
CREATE TABLE "morada" (
    "n_Idmorada" SERIAL NOT NULL,
    "t_rua" VARCHAR,
    "t_bairro" VARCHAR,
    "t_municipio" VARCHAR,

    CONSTRAINT "morada_pkey" PRIMARY KEY ("n_Idmorada")
);

-- CreateTable
CREATE TABLE "tipo_cota" (
    "n_Idtipoconta" SERIAL NOT NULL,
    "t_descricao" VARCHAR,

    CONSTRAINT "tipo_cota_pkey" PRIMARY KEY ("n_Idtipoconta")
);

-- CreateTable
CREATE TABLE "trasacao" (
    "n_Idtrasacao" SERIAL NOT NULL,
    "n_contaorigem" INTEGER NOT NULL,
    "n_contadestino" INTEGER,
    "n_valor" INTEGER,
    "t_descricao" TEXT,
    "t_datatrasacao" VARCHAR,
    "n_saldoactual" INTEGER,

    CONSTRAINT "trasacao_pkey" PRIMARY KEY ("n_Idtrasacao")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_t_BI_key" ON "cliente"("t_BI");

-- AddForeignKey
ALTER TABLE "Telefone" ADD CONSTRAINT "Telefone_n_Idcliente_fkey" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cartao" ADD CONSTRAINT "cartao_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_n_Idmorada_fkey" FOREIGN KEY ("n_Idmorada") REFERENCES "morada"("n_Idmorada") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta" ADD CONSTRAINT "conta_n_Idcliente_fkey" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta" ADD CONSTRAINT "conta_n_Idtipoconta_fkey" FOREIGN KEY ("n_Idtipoconta") REFERENCES "tipo_cota"("n_Idtipoconta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispositivo" ADD CONSTRAINT "dispositivo_n_IDusuarios_fkey" FOREIGN KEY ("n_IDusuarios") REFERENCES "cliente"("n_Idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "images_cliente" ADD CONSTRAINT "images_cliente_n_Idcliente_fkey" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trasacao" ADD CONSTRAINT "trasacao_n_contaorigem_fkey" FOREIGN KEY ("n_contaorigem") REFERENCES "conta"("n_Idconta") ON DELETE NO ACTION ON UPDATE NO ACTION;
