CREATE TYPE "public"."frakTxStatus" AS ENUM('pending', 'confirmed');--> statement-breakpoint
CREATE TYPE "public"."shopifyPurchaseStatus" AS ENUM('pending', 'active', 'declined', 'expired');--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"shopId" text NOT NULL,
	"shop" text NOT NULL,
	"purchaseId" text NOT NULL,
	"confirmationUrl" text NOT NULL,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"status" "shopifyPurchaseStatus" NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"txHash" text,
	"txStatus" "frakTxStatus"
);
