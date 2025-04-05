/*
  Warnings:

  - You are about to drop the column `username` on the `accounts` table. All the data in the column will be lost.
  - The primary key for the `password_reset_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expiresAt` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `password_reset_tokens` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `password_reset_tokens` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - Added the required column `first_name` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `password_reset_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "password_reset_tokens_email_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "username",
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "country_code" VARCHAR(5),
ADD COLUMN     "current_login_ip" VARCHAR(45),
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "failed_login_at" TIMESTAMP(3),
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "first_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "is_account_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_failed_login_ip" VARCHAR(45),
ADD COLUMN     "last_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "last_password_reset_at" TIMESTAMP(3),
ADD COLUMN     "phone_number" VARCHAR(15),
ADD COLUMN     "previous_login_ip" VARCHAR(45),
ADD COLUMN     "profile_image_url" VARCHAR(255),
ADD COLUMN     "state" VARCHAR(100),
ADD COLUMN     "street_address" VARCHAR(255),
ADD COLUMN     "zip_code" VARCHAR(20);

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_pkey",
DROP COLUMN "expiresAt",
DROP COLUMN "isUsed",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(12),
ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");
