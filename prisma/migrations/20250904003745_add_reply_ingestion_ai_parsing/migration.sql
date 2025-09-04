-- CreateEnum
CREATE TYPE "public"."ReplyStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "public"."ReplySource" AS ENUM ('IMAP', 'WEBHOOK', 'MANUAL', 'API');

-- CreateEnum
CREATE TYPE "public"."ParsingType" AS ENUM ('PRICE_EXTRACTION', 'CURRENCY_DETECTION', 'TERMS_EXTRACTION', 'CONTACT_EXTRACTION', 'QUOTE_SUMMARY', 'ATTACHMENT_PARSING');

-- CreateEnum
CREATE TYPE "public"."ValidationStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "public"."ProcessingType" AS ENUM ('EMAIL_PARSING', 'PRICE_EXTRACTION', 'CURRENCY_CONVERSION', 'TERMS_ANALYSIS', 'CONTACT_MATCHING', 'THREAD_MATCHING');

-- CreateEnum
CREATE TYPE "public"."ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "public"."email_replies" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "in_reply_to" TEXT,
    "references" TEXT[],
    "thread_id" TEXT,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT,
    "body_text" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3),
    "status" "public"."ReplyStatus" NOT NULL DEFAULT 'RECEIVED',
    "source" "public"."ReplySource" NOT NULL DEFAULT 'IMAP',
    "raw_content" TEXT,
    "headers" JSONB,
    "rfq_id" TEXT,
    "contact_id" TEXT,
    "shipping_line_id" TEXT,
    "quote_id" TEXT,
    "confidence_score" DECIMAL(3,2),
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "review_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_attachments" (
    "id" TEXT NOT NULL,
    "email_reply_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "file_path" TEXT,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "processing_status" TEXT,
    "extracted_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_parsing_results" (
    "id" TEXT NOT NULL,
    "email_reply_id" TEXT NOT NULL,
    "parsing_type" "public"."ParsingType" NOT NULL,
    "extracted_data" JSONB NOT NULL,
    "confidence_score" DECIMAL(3,2) NOT NULL,
    "raw_text" TEXT,
    "processed_text" TEXT,
    "validation_status" "public"."ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validation_notes" TEXT,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_parsing_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."imap_configurations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "secure" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "folder" TEXT NOT NULL DEFAULT 'INBOX',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_checked_at" TIMESTAMP(3),
    "last_error_at" TIMESTAMP(3),
    "last_error_message" TEXT,
    "check_interval" INTEGER NOT NULL DEFAULT 300,
    "max_emails_per_check" INTEGER NOT NULL DEFAULT 50,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imap_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_webhooks" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "webhook_url" TEXT NOT NULL,
    "secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_received_at" TIMESTAMP(3),
    "last_error_at" TIMESTAMP(3),
    "last_error_message" TEXT,
    "total_received" INTEGER NOT NULL DEFAULT 0,
    "total_processed" INTEGER NOT NULL DEFAULT 0,
    "total_failed" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_processing_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email_reply_id" TEXT,
    "processing_type" "public"."ProcessingType" NOT NULL,
    "input_data" JSONB NOT NULL,
    "output_data" JSONB,
    "confidence_score" DECIMAL(3,2),
    "processing_time" INTEGER,
    "status" "public"."ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "model_version" TEXT,
    "cost" DECIMAL(10,4),
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_processing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parsing_learning_data" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "extracted_data" JSONB NOT NULL,
    "corrected_data" JSONB,
    "confidence_score" DECIMAL(3,2) NOT NULL,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "correction_notes" TEXT,
    "corrected_by" TEXT,
    "corrected_at" TIMESTAMP(3),
    "parsing_type" "public"."ParsingType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parsing_learning_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_replies_message_id_key" ON "public"."email_replies"("message_id");

-- AddForeignKey
ALTER TABLE "public"."email_replies" ADD CONSTRAINT "email_replies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_replies" ADD CONSTRAINT "email_replies_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_replies" ADD CONSTRAINT "email_replies_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_replies" ADD CONSTRAINT "email_replies_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "public"."shipping_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_replies" ADD CONSTRAINT "email_replies_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_replies" ADD CONSTRAINT "email_replies_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_attachments" ADD CONSTRAINT "email_attachments_email_reply_id_fkey" FOREIGN KEY ("email_reply_id") REFERENCES "public"."email_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_parsing_results" ADD CONSTRAINT "email_parsing_results_email_reply_id_fkey" FOREIGN KEY ("email_reply_id") REFERENCES "public"."email_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_parsing_results" ADD CONSTRAINT "email_parsing_results_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imap_configurations" ADD CONSTRAINT "imap_configurations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."imap_configurations" ADD CONSTRAINT "imap_configurations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_webhooks" ADD CONSTRAINT "email_webhooks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_webhooks" ADD CONSTRAINT "email_webhooks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."company_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_processing_logs" ADD CONSTRAINT "ai_processing_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_processing_logs" ADD CONSTRAINT "ai_processing_logs_email_reply_id_fkey" FOREIGN KEY ("email_reply_id") REFERENCES "public"."email_replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parsing_learning_data" ADD CONSTRAINT "parsing_learning_data_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parsing_learning_data" ADD CONSTRAINT "parsing_learning_data_corrected_by_fkey" FOREIGN KEY ("corrected_by") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
