-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('bidder', 'auctioneer', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'active', 'suspended', 'banned');

-- CreateTable
CREATE TABLE "accounts" (
    "account_id" VARCHAR(50) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(225) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "user_role" "UserRole" NOT NULL DEFAULT 'bidder',
    "is_google_login" BOOLEAN NOT NULL DEFAULT false,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'pending',
    "verification_token" VARCHAR(255),
    "verification_expires_at" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_email_key" ON "password_reset_tokens"("email");
