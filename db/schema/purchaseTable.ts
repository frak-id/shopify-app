import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const shopifyStatus = pgEnum("shopifyPurchaseStatus", [
    "pending",
    "active",
    "declined",
    "expired",
]);
export const frakTxStatus = pgEnum("frakTxStatus", ["pending", "confirmed"]);

export const purchaseTable = pgTable("purchase" as string, {
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
    bank: text("bank").notNull(),
});

export type PurchaseTable = typeof purchaseTable;
