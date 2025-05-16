-- DropForeignKey
ALTER TABLE "auction_image" DROP CONSTRAINT "auction_image_auction_id_fkey";

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

-- AddForeignKey
ALTER TABLE "auction_image" ADD CONSTRAINT "auction_image_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("auction_id") ON DELETE CASCADE ON UPDATE CASCADE;
