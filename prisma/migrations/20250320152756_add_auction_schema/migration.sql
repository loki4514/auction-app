-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('electronics', 'fashion', 'automobiles', 'real_estate', 'art', 'collectibles', 'home_appliances', 'sports', 'others');

-- CreateEnum
CREATE TYPE "auction_status" AS ENUM ('upcoming', 'ongoing', 'completed', 'canceled');

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

-- CreateTable
CREATE TABLE "auction" (
    "auction_id" TEXT NOT NULL,
    "auction_name" TEXT NOT NULL,
    "auction_product_type" "product_type" NOT NULL,
    "auction_details" TEXT,
    "max_participants" INTEGER NOT NULL,
    "auction_video_url" TEXT,
    "min_next_bid_increment" DOUBLE PRECISION NOT NULL,
    "initial_bid_amount" DOUBLE PRECISION NOT NULL,
    "currency" "currency" NOT NULL,
    "auction_start_time" TIMESTAMP(3) NOT NULL,
    "auction_end_time" TIMESTAMP(3) NOT NULL,
    "status" "auction_status" NOT NULL DEFAULT 'upcoming',
    "auctioneer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "auction_image" (
    "image_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_image_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "auction_file" (
    "file_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_file_pkey" PRIMARY KEY ("file_id")
);

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_auctioneer_id_fkey" FOREIGN KEY ("auctioneer_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_image" ADD CONSTRAINT "auction_image_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_file" ADD CONSTRAINT "auction_file_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;
