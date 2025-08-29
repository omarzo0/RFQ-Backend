-- CreateEnum
CREATE TYPE "public"."AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('ADMIN', 'COMPANY_USER');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."RFQStatus" AS ENUM ('DRAFT', 'SENT', 'CLOSED', 'AWARDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."Urgency" AS ENUM ('URGENT', 'NORMAL', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "public"."QuoteSource" AS ENUM ('EMAIL', 'MANUAL', 'PHONE', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'WITHDRAWN', 'AWARDED');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."FollowUpStatus" AS ENUM ('SCHEDULED', 'SENT', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."FeatureType" AS ENUM ('BOOLEAN', 'LIMIT', 'ADDON');

-- CreateEnum
CREATE TYPE "public"."TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "public"."AdminRole" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "domain" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "subscription_plan" TEXT NOT NULL DEFAULT 'trial',
    "subscription_status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripe_customer_id" TEXT,
    "trial_ends_at" TIMESTAMP(3),
    "email_footer" TEXT,
    "default_follow_up_days" INTEGER NOT NULL DEFAULT 3,
    "auto_follow_up_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_users" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "admin_user_id" TEXT,
    "company_user_id" TEXT,
    "user_type" "public"."UserType" NOT NULL,
    "company_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipping_lines" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "website" TEXT,
    "headquarters_location" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "shipping_line_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "job_title" TEXT,
    "department" TEXT,
    "tags" TEXT[],
    "notes" TEXT,
    "performance_score" INTEGER NOT NULL DEFAULT 0,
    "do_not_contact" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rfq_templates" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject_template" TEXT NOT NULL,
    "body_template" TEXT NOT NULL,
    "origin_port" TEXT,
    "destination_port" TEXT,
    "commodity" TEXT,
    "container_type" TEXT,
    "container_quantity" INTEGER,
    "cargo_weight" DECIMAL(10,2),
    "cargo_volume" DECIMAL(10,2),
    "incoterm" TEXT,
    "special_requirements" TEXT,
    "required_services" TEXT[],
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rfqs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "rfq_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "origin_port" TEXT NOT NULL,
    "destination_port" TEXT NOT NULL,
    "commodity" TEXT,
    "container_type" TEXT,
    "container_quantity" INTEGER NOT NULL DEFAULT 1,
    "cargo_weight" DECIMAL(10,2),
    "cargo_volume" DECIMAL(10,2),
    "incoterm" TEXT NOT NULL DEFAULT 'FOB',
    "cargo_ready_date" TIMESTAMP(3),
    "quote_deadline" TIMESTAMP(3),
    "shipment_urgency" "public"."Urgency" NOT NULL DEFAULT 'NORMAL',
    "special_requirements" TEXT,
    "required_services" TEXT[],
    "preferred_carriers" TEXT[],
    "email_subject" TEXT,
    "email_body" TEXT,
    "status" "public"."RFQStatus" NOT NULL DEFAULT 'DRAFT',
    "sent_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "total_contacts_sent" INTEGER NOT NULL DEFAULT 0,
    "total_quotes_received" INTEGER NOT NULL DEFAULT 0,
    "best_quote_amount" DECIMAL(12,2),
    "average_quote_amount" DECIMAL(12,2),
    "created_by" TEXT NOT NULL,
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rfq_recipients" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "shipping_line_id" TEXT NOT NULL,
    "email_sent_at" TIMESTAMP(3) NOT NULL,
    "email_delivered_at" TIMESTAMP(3),
    "email_opened_at" TIMESTAMP(3),
    "email_clicked_at" TIMESTAMP(3),
    "last_email_activity_at" TIMESTAMP(3),
    "has_responded" BOOLEAN NOT NULL DEFAULT false,
    "response_received_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quotes" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "shipping_line_id" TEXT NOT NULL,
    "quote_reference" TEXT,
    "ocean_freight" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "baf" DECIMAL(12,2),
    "caf" DECIMAL(12,2),
    "security_fee" DECIMAL(12,2),
    "documentation_fee" DECIMAL(12,2),
    "handling_charges" DECIMAL(12,2),
    "other_charges" JSONB,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "validity_date" TIMESTAMP(3) NOT NULL,
    "payment_terms" TEXT,
    "transit_time" TEXT,
    "free_time_at_origin" INTEGER,
    "free_time_at_destination" INTEGER,
    "terms_and_conditions" TEXT,
    "special_notes" TEXT,
    "source" "public"."QuoteSource" NOT NULL DEFAULT 'EMAIL',
    "is_parsed_by_ai" BOOLEAN NOT NULL DEFAULT false,
    "confidence_score" DECIMAL(3,2),
    "raw_email_content" TEXT,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT,
    "supported_tokens" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'en',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT,
    "body_text" TEXT,
    "message_id" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "rfq_id" TEXT,
    "contact_id" TEXT,
    "template_id" TEXT,
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."follow_up_rules" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "days_after_send" INTEGER NOT NULL DEFAULT 3,
    "only_if_not_opened" BOOLEAN NOT NULL DEFAULT false,
    "only_if_not_replied" BOOLEAN NOT NULL DEFAULT true,
    "max_follow_ups" INTEGER NOT NULL DEFAULT 2,
    "email_template_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_up_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scheduled_follow_ups" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "follow_up_rule_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "status" "public"."FollowUpStatus" NOT NULL DEFAULT 'SCHEDULED',
    "skip_reason" TEXT,
    "follow_up_sequence" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."carrier_performance_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "shipping_line_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "rfqs_received" INTEGER NOT NULL DEFAULT 0,
    "quotes_submitted" INTEGER NOT NULL DEFAULT 0,
    "response_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "average_response_time_hours" DECIMAL(8,2),
    "quotes_won" INTEGER NOT NULL DEFAULT 0,
    "win_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "average_quote_amount" DECIMAL(12,2),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrier_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_performance_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "origin_port" TEXT NOT NULL,
    "destination_port" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "total_rfqs" INTEGER NOT NULL DEFAULT 0,
    "total_quotes" INTEGER NOT NULL DEFAULT 0,
    "average_quote_amount" DECIMAL(12,2),
    "lowest_quote_amount" DECIMAL(12,2),
    "highest_quote_amount" DECIMAL(12,2),
    "most_competitive_carrier_id" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "feature_key" TEXT NOT NULL,
    "feature_type" "public"."FeatureType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" DECIMAL(10,2),
    "price_yearly" DECIMAL(10,2),
    "max_users" INTEGER,
    "max_rfqs_per_month" INTEGER,
    "max_contacts" INTEGER,
    "max_email_sends_per_month" INTEGER,
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usage_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "rfqs_created" INTEGER NOT NULL DEFAULT 0,
    "emails_sent" INTEGER NOT NULL DEFAULT 0,
    "ai_parsing_requests" INTEGER NOT NULL DEFAULT 0,
    "api_calls" INTEGER NOT NULL DEFAULT 0,
    "file_storage_mb" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_endpoints" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_success_at" TIMESTAMP(3),
    "last_failure_at" TIMESTAMP(3),
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_keys" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "key_name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "scopes" TEXT[],
    "rate_limit_per_hour" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_tickets" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "user_id" TEXT,
    "user_type" "public"."UserType",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "public"."TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "category" TEXT,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "public"."companies"("email");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_company_id_email_key" ON "public"."company_users"("company_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_lines_company_id_name_key" ON "public"."shipping_lines"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_company_id_shipping_line_id_email_key" ON "public"."contacts"("company_id", "shipping_line_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_company_id_rfq_number_key" ON "public"."rfqs"("company_id", "rfq_number");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_recipients_rfq_id_contact_id_key" ON "public"."rfq_recipients"("rfq_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_company_id_name_key" ON "public"."email_templates"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "carrier_performance_metrics_company_id_shipping_line_id_per_key" ON "public"."carrier_performance_metrics"("company_id", "shipping_line_id", "period_start", "period_end", "period_type");

-- CreateIndex
CREATE UNIQUE INDEX "route_performance_metrics_company_id_origin_port_destinatio_key" ON "public"."route_performance_metrics"("company_id", "origin_port", "destination_port", "period_start", "period_end", "period_type");

-- CreateIndex
CREATE UNIQUE INDEX "system_features_name_key" ON "public"."system_features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "system_features_feature_key_key" ON "public"."system_features"("feature_key");

-- CreateIndex
CREATE UNIQUE INDEX "usage_metrics_company_id_period_month_period_year_key" ON "public"."usage_metrics"("company_id", "period_month", "period_year");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_api_key_key" ON "public"."api_keys"("api_key");

-- AddForeignKey
ALTER TABLE "public"."company_users" ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipping_lines" ADD CONSTRAINT "shipping_lines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipping_lines" ADD CONSTRAINT "shipping_lines_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "public"."shipping_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfq_templates" ADD CONSTRAINT "rfq_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfq_templates" ADD CONSTRAINT "rfq_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfqs" ADD CONSTRAINT "rfqs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfqs" ADD CONSTRAINT "rfqs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfqs" ADD CONSTRAINT "rfqs_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfq_recipients" ADD CONSTRAINT "rfq_recipients_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfq_recipients" ADD CONSTRAINT "rfq_recipients_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rfq_recipients" ADD CONSTRAINT "rfq_recipients_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "public"."shipping_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "public"."shipping_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow_up_rules" ADD CONSTRAINT "follow_up_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow_up_rules" ADD CONSTRAINT "follow_up_rules_email_template_id_fkey" FOREIGN KEY ("email_template_id") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow_up_rules" ADD CONSTRAINT "follow_up_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_follow_ups" ADD CONSTRAINT "scheduled_follow_ups_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_follow_ups" ADD CONSTRAINT "scheduled_follow_ups_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scheduled_follow_ups" ADD CONSTRAINT "scheduled_follow_ups_follow_up_rule_id_fkey" FOREIGN KEY ("follow_up_rule_id") REFERENCES "public"."follow_up_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carrier_performance_metrics" ADD CONSTRAINT "carrier_performance_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carrier_performance_metrics" ADD CONSTRAINT "carrier_performance_metrics_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "public"."shipping_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_performance_metrics" ADD CONSTRAINT "route_performance_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_performance_metrics" ADD CONSTRAINT "route_performance_metrics_most_competitive_carrier_id_fkey" FOREIGN KEY ("most_competitive_carrier_id") REFERENCES "public"."shipping_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_metrics" ADD CONSTRAINT "usage_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_keys" ADD CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
