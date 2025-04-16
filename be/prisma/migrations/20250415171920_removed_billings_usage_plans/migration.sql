/*
  Warnings:

  - You are about to drop the column `billingAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingTier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsageRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_userId_fkey";

-- DropForeignKey
ALTER TABLE "PricingTier" DROP CONSTRAINT "PricingTier_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pricingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "UsageRecord" DROP CONSTRAINT "UsageRecord_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "UsageRecord" DROP CONSTRAINT "UsageRecord_billId_fkey";

-- DropForeignKey
ALTER TABLE "UsageRecord" DROP CONSTRAINT "UsageRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionId_fkey";

-- DropIndex
DROP INDEX "User_subscriptionId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "billingAddress",
DROP COLUMN "paymentMethod",
DROP COLUMN "subscriptionId";

-- DropTable
DROP TABLE "Bill";

-- DropTable
DROP TABLE "PricingPlan";

-- DropTable
DROP TABLE "PricingTier";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "UsageRecord";
