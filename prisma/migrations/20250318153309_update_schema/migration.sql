-- CreateEnum
CREATE TYPE "currency" AS ENUM ('INR', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('cashfree');

-- AlterTable
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DEFAULT substring(md5(random()::text), 1, 12);

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
    "max_images" INTEGER NOT NULL,
    "max_videos" INTEGER NOT NULL,
    "storage_limit_gb" DOUBLE PRECISION NOT NULL,
    "extra_features" TEXT,

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
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "price_paid" DOUBLE PRECISION NOT NULL,
    "currency" "currency" NOT NULL,
    "status" "subscription_status" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "payment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "plan_name_key" ON "plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_id_key" ON "payment"("transaction_id");

-- AddForeignKey
ALTER TABLE "plan_addon" ADD CONSTRAINT "plan_addon_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_addon" ADD CONSTRAINT "plan_addon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon"("addon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addon" ADD CONSTRAINT "user_addon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addon" ADD CONSTRAINT "user_addon_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon"("addon_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon"("addon_id") ON DELETE SET NULL ON UPDATE CASCADE;
