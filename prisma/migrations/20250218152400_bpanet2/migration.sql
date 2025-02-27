/*
  Warnings:

  - A unique constraint covering the columns `[t_email_address]` on the table `client_email` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "client_email" ALTER COLUMN "t_email_address" SET DATA TYPE VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "client_email_t_email_address_key" ON "client_email"("t_email_address");
