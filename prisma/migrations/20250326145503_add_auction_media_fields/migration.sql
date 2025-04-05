/*
  Warnings:

  - The values [canceled] on the enum `auction_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "auction_status_new" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
ALTER TABLE "auction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "auction" ALTER COLUMN "status" TYPE "auction_status_new" USING ("status"::text::"auction_status_new");
ALTER TYPE "auction_status" RENAME TO "auction_status_old";
ALTER TYPE "auction_status_new" RENAME TO "auction_status";
DROP TYPE "auction_status_old";
ALTER TABLE "auction" ALTER COLUMN "status" SET DEFAULT 'upcoming';
COMMIT;

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);
