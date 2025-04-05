-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "first_name" SET DEFAULT 'Unknown',
ALTER COLUMN "first_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "last_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "profile_image_url" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);
