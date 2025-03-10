/*
  Warnings:

  - A unique constraint covering the columns `[n_Idconta]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usuario_n_Idconta_key" ON "usuario"("n_Idconta");
