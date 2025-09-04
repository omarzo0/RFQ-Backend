-- AlterTable
ALTER TABLE "public"."shipping_lines" ADD COLUMN     "headquarters_country" TEXT,
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reliability" INTEGER,
ADD COLUMN     "scac_code" TEXT,
ADD COLUMN     "serviceQuality" INTEGER,
ADD COLUMN     "services" TEXT[],
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "trade_lanes" TEXT[];
