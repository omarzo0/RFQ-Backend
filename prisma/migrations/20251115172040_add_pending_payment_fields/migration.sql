-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "payment_deadline" TIMESTAMP(3),
ADD COLUMN     "pending_plan_id" TEXT;
