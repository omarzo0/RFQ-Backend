-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."EmailType" ADD VALUE 'PAYMENT_CONFIRMATION';
ALTER TYPE "public"."EmailType" ADD VALUE 'TRIAL_WARNING';
ALTER TYPE "public"."EmailType" ADD VALUE 'TRIAL_EXPIRED';
ALTER TYPE "public"."EmailType" ADD VALUE 'PAYMENT_RECEIPT';

-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "stripe_subscription_id" TEXT;
