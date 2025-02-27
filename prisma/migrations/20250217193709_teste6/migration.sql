/*
  Warnings:

  - You are about to drop the column `t_tolken` on the `cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cliente" DROP COLUMN "t_tolken",
ADD COLUMN     "t_codigo2fa" TEXT;
