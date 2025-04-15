/*
  Warnings:

  - The primary key for the `ParametroDeposito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ParametroDeposito` table. All the data in the column will be lost.
  - You are about to drop the column `moeda` on the `ParametroDeposito` table. All the data in the column will be lost.
  - You are about to drop the column `montanteMax` on the `ParametroDeposito` table. All the data in the column will be lost.
  - You are about to drop the column `montanteMin` on the `ParametroDeposito` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `ParametroDeposito` table. All the data in the column will be lost.
  - You are about to drop the column `prazo` on the `ParametroDeposito` table. All the data in the column will be lost.
  - You are about to drop the column `tanb` on the `ParametroDeposito` table. All the data in the column will be lost.
  - The primary key for the `depositoAPrazo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dataCriacao` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `dataVencimento` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `jurosBrutos` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `jurosLiquidos` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `moeda` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `parametroDepositoId` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `depositoAPrazo` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `depositoAPrazo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[t_nome]` on the table `ParametroDeposito` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `n_montanteMax` to the `ParametroDeposito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_montanteMin` to the `ParametroDeposito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_prazo` to the `ParametroDeposito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_tanb` to the `ParametroDeposito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `t_nome` to the `ParametroDeposito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_jurosBrutos` to the `depositoAPrazo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_jurosLiquidos` to the `depositoAPrazo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_parametroDepositoId` to the `depositoAPrazo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_valor` to the `depositoAPrazo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `t_dataVencimento` to the `depositoAPrazo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "depositoAPrazo" DROP CONSTRAINT "depositoAPrazo_parametroDepositoId_fkey";

-- DropIndex
DROP INDEX "ParametroDeposito_nome_key";

-- DropIndex
DROP INDEX "depositoAPrazo_dataVencimento_idx";

-- DropIndex
DROP INDEX "depositoAPrazo_status_idx";

-- AlterTable
ALTER TABLE "LevantamentoSemCartao" ALTER COLUMN "t_data_solicitacao" SET DEFAULT now(),
ALTER COLUMN "t_data_expiracao" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "ParametroDeposito" DROP CONSTRAINT "ParametroDeposito_pkey",
DROP COLUMN "id",
DROP COLUMN "moeda",
DROP COLUMN "montanteMax",
DROP COLUMN "montanteMin",
DROP COLUMN "nome",
DROP COLUMN "prazo",
DROP COLUMN "tanb",
ADD COLUMN     "n_idparametro" SERIAL NOT NULL,
ADD COLUMN     "n_montanteMax" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "n_montanteMin" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "n_prazo" INTEGER NOT NULL,
ADD COLUMN     "n_tanb" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "t_moeda" TEXT NOT NULL DEFAULT 'AOA',
ADD COLUMN     "t_nome" TEXT NOT NULL,
ADD CONSTRAINT "ParametroDeposito_pkey" PRIMARY KEY ("n_idparametro");

-- AlterTable
ALTER TABLE "depositoAPrazo" DROP CONSTRAINT "depositoAPrazo_pkey",
DROP COLUMN "dataCriacao",
DROP COLUMN "dataVencimento",
DROP COLUMN "id",
DROP COLUMN "jurosBrutos",
DROP COLUMN "jurosLiquidos",
DROP COLUMN "moeda",
DROP COLUMN "parametroDepositoId",
DROP COLUMN "status",
DROP COLUMN "valor",
ADD COLUMN     "n_iddeposito" SERIAL NOT NULL,
ADD COLUMN     "n_jurosBrutos" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "n_jurosLiquidos" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "n_parametroDepositoId" INTEGER NOT NULL,
ADD COLUMN     "n_valor" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "t_dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "t_dataVencimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "t_status" TEXT NOT NULL DEFAULT 'ATIVO',
ADD CONSTRAINT "depositoAPrazo_pkey" PRIMARY KEY ("n_iddeposito");

-- CreateIndex
CREATE UNIQUE INDEX "ParametroDeposito_t_nome_key" ON "ParametroDeposito"("t_nome");

-- CreateIndex
CREATE INDEX "depositoAPrazo_t_dataVencimento_idx" ON "depositoAPrazo"("t_dataVencimento");

-- CreateIndex
CREATE INDEX "depositoAPrazo_t_status_idx" ON "depositoAPrazo"("t_status");

-- AddForeignKey
ALTER TABLE "depositoAPrazo" ADD CONSTRAINT "depositoAPrazo_n_parametroDepositoId_fkey" FOREIGN KEY ("n_parametroDepositoId") REFERENCES "ParametroDeposito"("n_idparametro") ON DELETE RESTRICT ON UPDATE CASCADE;
