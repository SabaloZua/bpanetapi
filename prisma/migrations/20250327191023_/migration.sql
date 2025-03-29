/*
  Warnings:

  - You are about to drop the column `tokenVersion` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_n_id_usuario_fkey";

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "tokenVersion";

-- DropTable
DROP TABLE "Session";
