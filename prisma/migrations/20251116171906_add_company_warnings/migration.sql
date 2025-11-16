-- CreateEnum
CREATE TYPE "public"."WarningSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."WarningCategory" AS ENUM ('GENERAL', 'PAYMENT', 'POLICY_VIOLATION', 'SECURITY', 'PERFORMANCE', 'COMPLIANCE', 'ABUSE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."company_warnings" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" "public"."WarningSeverity" NOT NULL DEFAULT 'MODERATE',
    "category" "public"."WarningCategory" NOT NULL DEFAULT 'GENERAL',
    "issued_by" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "action_required" TEXT,
    "notes" TEXT,

    CONSTRAINT "company_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_warnings_company_id_is_resolved_idx" ON "public"."company_warnings"("company_id", "is_resolved");

-- CreateIndex
CREATE INDEX "company_warnings_severity_is_resolved_idx" ON "public"."company_warnings"("severity", "is_resolved");

-- AddForeignKey
ALTER TABLE "public"."company_warnings" ADD CONSTRAINT "company_warnings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_warnings" ADD CONSTRAINT "company_warnings_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "public"."admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_warnings" ADD CONSTRAINT "company_warnings_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
