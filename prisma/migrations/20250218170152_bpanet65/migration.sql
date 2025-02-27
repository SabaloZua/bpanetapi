/*
  Warnings:

  - The primary key for the `dispositivo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `n_IDusuarios` on the `dispositivo` table. All the data in the column will be lost.
  - You are about to drop the column `n_Iddispositivo` on the `dispositivo` table. All the data in the column will be lost.
  - Added the required column `n_Idcliente` to the `dispositivo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `t_Iddispositivo` to the `dispositivo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dispositivo" DROP CONSTRAINT "dispositivo_n_IDusuarios_fkey";

-- AlterTable
ALTER TABLE "dispositivo" DROP CONSTRAINT "dispositivo_pkey",
DROP COLUMN "n_IDusuarios",
DROP COLUMN "n_Iddispositivo",
ADD COLUMN     "n_Idcliente" INTEGER NOT NULL,
ADD COLUMN     "t_Iddispositivo" TEXT NOT NULL,
ADD CONSTRAINT "dispositivo_pkey" PRIMARY KEY ("t_Iddispositivo");

-- AddForeignKey
ALTER TABLE "dispositivo" ADD CONSTRAINT "dispositivo_n_Idcliente_fkey" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;
