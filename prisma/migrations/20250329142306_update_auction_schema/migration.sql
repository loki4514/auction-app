/*
  Warnings:

  - Added the required column `auction_type` to the `auction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "auction_type" AS ENUM ('live', 'timed');

-- AlterTable
ALTER TABLE "auction" ADD COLUMN     "auction_type" "auction_type" NOT NULL,
ALTER COLUMN "max_participants" DROP NOT NULL,
ALTER COLUMN "auction_end_time" DROP NOT NULL;

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

-- AlterTable
ALTER TABLE "plan" ADD COLUMN     "max_live_auctions" INTEGER,
ADD COLUMN     "max_timed_auctions" INTEGER,
ADD COLUMN     "timed_auction_duration" INTEGER;
