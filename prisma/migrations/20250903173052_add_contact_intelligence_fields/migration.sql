-- AlterTable
ALTER TABLE "public"."contacts" ADD COLUMN     "avg_response_time" INTEGER,
ADD COLUMN     "communication_history" TEXT,
ADD COLUMN     "last_response_at" TIMESTAMP(3),
ADD COLUMN     "preferences" TEXT,
ADD COLUMN     "quote_quality" INTEGER,
ADD COLUMN     "reliability" INTEGER,
ADD COLUMN     "response_rate" DOUBLE PRECISION,
ADD COLUMN     "seniority" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "total_responses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_rfqs_sent" INTEGER NOT NULL DEFAULT 0;
