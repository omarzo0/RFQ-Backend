-- AlterTable
ALTER TABLE "public"."rfq_templates" ADD COLUMN     "category" TEXT,
ADD COLUMN     "dynamic_fields" JSONB,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "last_used_at" TIMESTAMP(3),
ADD COLUMN     "parent_template_id" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "template_variables" TEXT[],
ADD COLUMN     "trade_lane" TEXT,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "public"."rfq_templates" ADD CONSTRAINT "rfq_templates_parent_template_id_fkey" FOREIGN KEY ("parent_template_id") REFERENCES "public"."rfq_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
