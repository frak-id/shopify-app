import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const shopifyStatus = pgEnum("shopifyTxStatus", [
    "pending",
    "active",
    "declined",
    "expired",
]);
const frakTxStatus = pgEnum("frakTxStatus", ["pending", "confirmed", "failed"]);

/**
 * Same as the one from @shopify/shopify-app-session-storage-drizzle but using a recent version of drizzle-orm
 */
export const fundingTable = pgTable("funding" as string, {
    id: text("id").primaryKey(),
    // Shop info
    shopId: text("shopId").notNull(),
    shop: text("shop").notNull(),
    // Purchase info
    purchaseId: text("purchaseId").notNull(),
    confirmationUrl: text("confirmationUrl").notNull(),
    amount: text("amount").notNull(),
    currency: text("currency").notNull(),
    status: shopifyStatus("status").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
    // Frak side
    txHash: text("txHash"),
    txStatus: frakTxStatus("txStatus"),
});

export type FundingTable = typeof fundingTable;
