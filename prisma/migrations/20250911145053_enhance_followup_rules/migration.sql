-- CreateEnum
CREATE TYPE "public"."ScheduleType" AS ENUM ('IMMEDIATE', 'SPECIFIC_TIME', 'BUSINESS_HOURS', 'CUSTOM');

-- AlterTable
ALTER TABLE "public"."follow_up_rules" ADD COLUMN     "business_days_only" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "custom_schedule" JSONB,
ADD COLUMN     "exclude_holidays" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exclude_weekends" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "follow_up_intervals" JSONB,
ADD COLUMN     "max_time_since_open" INTEGER,
ADD COLUMN     "min_time_since_open" INTEGER,
ADD COLUMN     "only_if_clicked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "only_if_delivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "only_if_opened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "schedule_type" "public"."ScheduleType" NOT NULL DEFAULT 'IMMEDIATE',
ADD COLUMN     "specific_time" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "public"."scheduled_follow_ups" ADD COLUMN     "condition_met_at" TIMESTAMP(3),
ADD COLUMN     "condition_type" TEXT,
ADD COLUMN     "is_business_hours" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "original_scheduled_at" TIMESTAMP(3),
ADD COLUMN     "reschedule_reason" TEXT,
ADD COLUMN     "rescheduled_at" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "public"."system_features" ADD COLUMN     "category" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" TEXT[],
ADD COLUMN     "required_role" TEXT,
ADD COLUMN     "route" TEXT;

-- CreateTable
CREATE TABLE "public"."company_features" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "system_feature_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "custom_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_features_company_id_system_feature_id_key" ON "public"."company_features"("company_id", "system_feature_id");

-- AddForeignKey
ALTER TABLE "public"."company_features" ADD CONSTRAINT "company_features_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_features" ADD CONSTRAINT "company_features_system_feature_id_fkey" FOREIGN KEY ("system_feature_id") REFERENCES "public"."system_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
