-- AlterTable
ALTER TABLE "public"."quotes" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "awarded_by" TEXT,
ADD COLUMN     "awarded_date" TIMESTAMP(3),
ADD COLUMN     "carrier_benchmark" JSONB,
ADD COLUMN     "communication_score" INTEGER,
ADD COLUMN     "comparison_rank" INTEGER,
ADD COLUMN     "expiration_date" TIMESTAMP(3),
ADD COLUMN     "historical_comparison" JSONB,
ADD COLUMN     "is_awarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_expired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "market_position" TEXT,
ADD COLUMN     "market_trends" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "overall_score" DECIMAL(3,2),
ADD COLUMN     "price_competitiveness" DECIMAL(3,2),
ADD COLUMN     "quote_number" TEXT,
ADD COLUMN     "rate_optimization" JSONB,
ADD COLUMN     "received_date" TIMESTAMP(3),
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reliability" INTEGER,
ADD COLUMN     "response_time" INTEGER,
ADD COLUMN     "service_quality" INTEGER,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_awarded_by_fkey" FOREIGN KEY ("awarded_by") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."company_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
