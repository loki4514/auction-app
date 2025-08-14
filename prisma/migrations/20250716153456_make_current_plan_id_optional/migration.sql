-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_current_plan_id_fkey";

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "current_plan_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_current_plan_id_fkey" FOREIGN KEY ("current_plan_id") REFERENCES "plan"("plan_id") ON DELETE SET NULL ON UPDATE CASCADE;
