/*
  Warnings:

  - You are about to drop the column `user_id` on the `auction` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `auction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "auction" DROP CONSTRAINT "auction_auctioneer_id_fkey";

-- AlterTable
ALTER TABLE "auction" DROP COLUMN "user_id",
ADD COLUMN     "account_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "auction_metadata" (
    "id" VARCHAR(50) NOT NULL,
    "auction_id" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "device" VARCHAR(100),
    "os" VARCHAR(100),
    "location" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_metadata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_auctioneer_id_fkey" FOREIGN KEY ("auctioneer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_metadata" ADD CONSTRAINT "auction_metadata_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("auction_id") ON DELETE CASCADE ON UPDATE CASCADE;
