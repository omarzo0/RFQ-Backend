-- CreateEnum
CREATE TYPE "public"."EmailType" AS ENUM ('RFQ', 'FOLLOW_UP', 'BULK_EMAIL', 'CAMPAIGN', 'NOTIFICATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."EmailPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."BulkEmailStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CampaignType" AS ENUM ('RFQ_BLAST', 'FOLLOW_UP_CAMPAIGN', 'MARKETING', 'ANNOUNCEMENT', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EngagementType" AS ENUM ('OPEN', 'CLICK', 'REPLY', 'FORWARD', 'UNSUBSCRIBE');

-- CreateEnum
CREATE TYPE "public"."BounceType" AS ENUM ('HARD', 'SOFT', 'SPAM', 'BLOCKED', 'INVALID');

-- AlterTable
ALTER TABLE "public"."email_logs" ADD COLUMN     "bulk_email_id" TEXT,
ADD COLUMN     "campaign_id" TEXT,
ADD COLUMN     "email_type" "public"."EmailType" NOT NULL DEFAULT 'RFQ',
ADD COLUMN     "follow_up_rule_id" TEXT,
ADD COLUMN     "is_bulk_email" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "max_retries" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "next_retry_at" TIMESTAMP(3),
ADD COLUMN     "personalization_data" JSONB,
ADD COLUMN     "priority" "public"."EmailPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "scheduled_follow_up_id" TEXT,
ADD COLUMN     "scheduled_for" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "tracking_pixel_id" TEXT,
ADD COLUMN     "unsubscribe_token" TEXT;

-- CreateTable
CREATE TABLE "public"."bulk_emails" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT,
    "template_id" TEXT,
    "contact_ids" TEXT[],
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "bounced_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."BulkEmailStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduled_for" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "rate_limit_per_minute" INTEGER NOT NULL DEFAULT 10,
    "personalization_data" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_campaigns" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "campaign_type" "public"."CampaignType" NOT NULL DEFAULT 'RFQ_BLAST',
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "total_emails" INTEGER NOT NULL DEFAULT 0,
    "sent_emails" INTEGER NOT NULL DEFAULT 0,
    "delivered_emails" INTEGER NOT NULL DEFAULT 0,
    "opened_emails" INTEGER NOT NULL DEFAULT 0,
    "clicked_emails" INTEGER NOT NULL DEFAULT 0,
    "bounced_emails" INTEGER NOT NULL DEFAULT 0,
    "failed_emails" INTEGER NOT NULL DEFAULT 0,
    "response_rate" DOUBLE PRECISION,
    "open_rate" DOUBLE PRECISION,
    "click_rate" DOUBLE PRECISION,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_engagements" (
    "id" TEXT NOT NULL,
    "email_log_id" TEXT NOT NULL,
    "engagement_type" "public"."EngagementType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "location" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "link_url" TEXT,
    "link_text" TEXT,

    CONSTRAINT "email_engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_bounces" (
    "id" TEXT NOT NULL,
    "email_log_id" TEXT NOT NULL,
    "bounce_type" "public"."BounceType" NOT NULL,
    "bounce_reason" TEXT,
    "bounce_code" TEXT,
    "bounced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_permanent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "email_bounces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_unsubscribes" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unsubscribe_token" TEXT NOT NULL,
    "reason" TEXT,
    "unsubscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_unsubscribes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_unsubscribes_unsubscribe_token_key" ON "public"."email_unsubscribes"("unsubscribe_token");

-- CreateIndex
CREATE UNIQUE INDEX "email_unsubscribes_company_id_email_key" ON "public"."email_unsubscribes"("company_id", "email");

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_follow_up_rule_id_fkey" FOREIGN KEY ("follow_up_rule_id") REFERENCES "public"."follow_up_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_scheduled_follow_up_id_fkey" FOREIGN KEY ("scheduled_follow_up_id") REFERENCES "public"."scheduled_follow_ups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_bulk_email_id_fkey" FOREIGN KEY ("bulk_email_id") REFERENCES "public"."bulk_emails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_emails" ADD CONSTRAINT "bulk_emails_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_emails" ADD CONSTRAINT "bulk_emails_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_emails" ADD CONSTRAINT "bulk_emails_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_campaigns" ADD CONSTRAINT "email_campaigns_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_engagements" ADD CONSTRAINT "email_engagements_email_log_id_fkey" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_bounces" ADD CONSTRAINT "email_bounces_email_log_id_fkey" FOREIGN KEY ("email_log_id") REFERENCES "public"."email_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_unsubscribes" ADD CONSTRAINT "email_unsubscribes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
