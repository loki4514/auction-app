/*
  Warnings:

  - You are about to drop the column `max_images` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `max_videos` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

-- AlterTable
ALTER TABLE "plan" DROP COLUMN "max_images",
DROP COLUMN "max_videos",
ADD COLUMN     "max_images_per_auction" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "max_videos_per_auction" INTEGER NOT NULL DEFAULT 1;
