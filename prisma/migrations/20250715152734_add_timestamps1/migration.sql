-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('bidder', 'auctioneer');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'verified', 'disabled', 'deleted', 'suspended', 'banned');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'verified', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('bidder', 'auctioneer', 'admin');

-- CreateEnum
CREATE TYPE "currency" AS ENUM ('INR', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cashfree');

-- CreateEnum
CREATE TYPE "auction_type" AS ENUM ('live', 'timed');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('electronics', 'fashion', 'automobiles', 'real_estate', 'art', 'collectibles', 'home_appliances', 'sports', 'others');

-- CreateEnum
CREATE TYPE "auction_status" AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "accounts" (
    "account_id" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "current_plan_id" TEXT NOT NULL,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'pending',
    "is_used_free_plan" BOOLEAN NOT NULL DEFAULT false,
    "account_type" "AccountType" NOT NULL DEFAULT 'bidder',
    "email" TEXT,
    "phone_number" VARCHAR(20),
    "country" VARCHAR(100),
    "country_code" VARCHAR(5),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "street_address" VARCHAR(255),
    "zip_code" VARCHAR(20),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(50) NOT NULL,
    "account_id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(225) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL DEFAULT 'Unknown',
    "last_name" VARCHAR(100) NOT NULL,
    "user_role" "UserRole" NOT NULL DEFAULT 'bidder',
    "user_status" "UserStatus" NOT NULL DEFAULT 'pending',
    "profile_image_url" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "phone_number" VARCHAR(15),
    "verification_token" VARCHAR(255),
    "verification_expires_at" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "failed_login_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login_ip" VARCHAR(45),
    "current_login_ip" VARCHAR(45),
    "previous_login_ip" VARCHAR(45),
    "last_password_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" VARCHAR(12) NOT NULL DEFAULT "substring"(md5((random())::text), 1, 12),
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
    "plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "price_inr" DOUBLE PRECISION NOT NULL,
    "price_eur" DOUBLE PRECISION NOT NULL,
    "auctions_per_month" INTEGER NOT NULL,
    "max_hosts" INTEGER NOT NULL,
    "max_bidders" INTEGER NOT NULL,
    "storage_limit_gb" DOUBLE PRECISION NOT NULL,
    "extra_features" TEXT,
    "max_live_auctions" INTEGER NOT NULL,
    "max_timed_auctions" INTEGER NOT NULL,
    "timed_auction_duration" INTEGER NOT NULL,
    "max_images_per_auction" INTEGER NOT NULL DEFAULT 5,
    "max_videos_per_auction" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "addon" (
    "addon_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_price_usd" DOUBLE PRECISION NOT NULL,
    "base_price_inr" DOUBLE PRECISION NOT NULL,
    "base_price_eur" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "addon_pkey" PRIMARY KEY ("addon_id")
);

-- CreateTable
CREATE TABLE "plan_addon" (
    "plan_addon_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "addon_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_addon_pkey" PRIMARY KEY ("plan_addon_id")
);

-- CreateTable
CREATE TABLE "user_addon" (
    "user_addon_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "addon_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "currency" "currency" NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addon_pkey" PRIMARY KEY ("user_addon_id")
);

-- CreateTable
CREATE TABLE "user_subscription" (
    "subscription_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "price_paid" DOUBLE PRECISION NOT NULL,
    "currency" "currency" NOT NULL,
    "status" "subscription_status" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "payment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "addon_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "currency" NOT NULL,
    "payment_method" "payment_method" NOT NULL DEFAULT 'cashfree',
    "status" "payment_status" NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "auction" (
    "auction_id" TEXT NOT NULL,
    "auction_name" TEXT NOT NULL,
    "auction_product_type" "product_type"[],
    "auction_details" TEXT,
    "max_participants" INTEGER,
    "min_next_bid_increment" DOUBLE PRECISION NOT NULL,
    "initial_bid_amount" DOUBLE PRECISION NOT NULL,
    "currency" "currency" NOT NULL,
    "auction_start_time" TIMESTAMP(3) NOT NULL,
    "auction_end_time" TIMESTAMP(3),
    "status" "auction_status" NOT NULL DEFAULT 'upcoming',
    "auctioneer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "auction_type" "auction_type" NOT NULL,
    "rejection_reason" TEXT,
    "rejection_status" BOOLEAN DEFAULT false,
    "user_id" TEXT NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "plan_name_key" ON "plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_id_key" ON "payment"("transaction_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_current_plan_id_fkey" FOREIGN KEY ("current_plan_id") REFERENCES "plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_addon" ADD CONSTRAINT "plan_addon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon"("addon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_addon" ADD CONSTRAINT "plan_addon_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addon" ADD CONSTRAINT "user_addon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon"("addon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addon" ADD CONSTRAINT "user_addon_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon"("addon_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction" ADD CONSTRAINT "auction_auctioneer_id_fkey" FOREIGN KEY ("auctioneer_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_image" ADD CONSTRAINT "auction_image_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("auction_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_file" ADD CONSTRAINT "auction_file_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;
