/*
  Warnings:

  - You are about to drop the column `auction_video_url` on the `auction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auction" DROP COLUMN "auction_video_url",
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "rejection_status" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);
