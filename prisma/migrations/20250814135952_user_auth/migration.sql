-- CreateEnum
CREATE TYPE "AuthEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'LOGOUT');

-- CreateTable
CREATE TABLE "user_auth_history" (
    "id" VARCHAR(50) NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" "AuthEventType" NOT NULL,
    "event_description" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "browser" VARCHAR(100),
    "device_type" VARCHAR(50),
    "location_city" VARCHAR(100),
    "location_region" VARCHAR(100),
    "location_country" VARCHAR(100),
    "location_latitude" DOUBLE PRECISION,
    "location_longitude" DOUBLE PRECISION,
    "verification_token" VARCHAR(255),
    "verification_expires_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_auth_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_auth_history_user_id_idx" ON "user_auth_history"("user_id");

-- CreateIndex
CREATE INDEX "user_auth_history_ip_address_idx" ON "user_auth_history"("ip_address");

-- AddForeignKey
ALTER TABLE "user_auth_history" ADD CONSTRAINT "user_auth_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
