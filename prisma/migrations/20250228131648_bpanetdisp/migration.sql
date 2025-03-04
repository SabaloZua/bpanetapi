/*
  Warnings:

  - The primary key for the `dispositivo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "dispositivo" DROP CONSTRAINT "dispositivo_pkey",
ADD COLUMN     "n_id" SERIAL NOT NULL,
ADD CONSTRAINT "dispositivo_pkey" PRIMARY KEY ("n_id");
