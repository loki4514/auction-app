-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

-- AlterTable
ALTER TABLE "user_subscription" ALTER COLUMN "end_date" DROP NOT NULL;
