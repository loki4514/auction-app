/*
  Warnings:

  - Made the column `max_live_auctions` on table `plan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_timed_auctions` on table `plan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timed_auction_duration` on table `plan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

-- AlterTable
ALTER TABLE "plan" ALTER COLUMN "max_live_auctions" SET NOT NULL,
ALTER COLUMN "max_timed_auctions" SET NOT NULL,
ALTER COLUMN "timed_auction_duration" SET NOT NULL;
