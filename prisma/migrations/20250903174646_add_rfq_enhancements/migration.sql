-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "public"."rfqs" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "estimated_value" DECIMAL(12,2),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "response_rate" DOUBLE PRECISION,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "trade_lane" TEXT;
