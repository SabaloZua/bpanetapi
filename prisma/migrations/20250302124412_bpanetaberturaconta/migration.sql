/*
  Warnings:

  - You are about to drop the column `n_adesao` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `t_codigo2fa` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `t_password` on the `cliente` table. All the data in the column will be lost.
  - You are about to drop the column `n_Idcliente` on the `dispositivo` table. All the data in the column will be lost.
  - You are about to drop the column `n_valor` on the `trasacao` table. All the data in the column will be lost.
  - Added the required column `n_id_usuario` to the `dispositivo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dispositivo" DROP CONSTRAINT "dispositivo_n_Idcliente_fkey";

-- DropIndex
DROP INDEX "dispositivo_n_Idcliente_t_Iddispositivo_idx";

-- AlterTable
ALTER TABLE "cliente" DROP COLUMN "n_adesao",
DROP COLUMN "t_codigo2fa",
DROP COLUMN "t_password";

-- AlterTable
ALTER TABLE "dispositivo" DROP COLUMN "n_Idcliente",
ADD COLUMN     "n_id_usuario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "trasacao" DROP COLUMN "n_valor",
ADD COLUMN     "n_credito" DOUBLE PRECISION,
ADD COLUMN     "n_debito" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "usuario" (
    "n_id_usuario" SERIAL NOT NULL,
    "n_adesao" INTEGER,
    "t_password" TEXT,
    "t_codigo2fa" TEXT,
    "n_Idconta" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("n_id_usuario")
);

-- CreateIndex
CREATE INDEX "dispositivo_n_id_usuario_t_Iddispositivo_idx" ON "dispositivo"("n_id_usuario", "t_Iddispositivo");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_n_Idconta_fkey" FOREIGN KEY ("n_Idconta") REFERENCES "conta"("n_Idconta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispositivo" ADD CONSTRAINT "dispositivo_n_id_usuario_fkey" FOREIGN KEY ("n_id_usuario") REFERENCES "usuario"("n_id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;
