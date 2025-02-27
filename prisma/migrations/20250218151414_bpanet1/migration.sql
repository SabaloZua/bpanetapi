/*
  Warnings:

  - You are about to drop the column `t_email` on the `cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cliente" DROP COLUMN "t_email";

-- CreateTable
CREATE TABLE "client_email" (
    "n_email_id" SERIAL NOT NULL,
    "t_email_address" TEXT NOT NULL,
    "t_verified" BOOLEAN NOT NULL DEFAULT false,
    "n_Idcliente" SMALLINT,
    "t_token" TEXT,

    CONSTRAINT "user_email_pkey" PRIMARY KEY ("n_email_id")
);

-- AddForeignKey
ALTER TABLE "client_email" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("n_Idcliente") REFERENCES "cliente"("n_Idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;
