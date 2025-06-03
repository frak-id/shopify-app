import { eq } from "drizzle-orm";
import { isAddress } from "viem";
import { purchaseTable } from "../../db/schema/purchaseTable";
import { drizzleDb } from "../db.server";
import type { AuthenticatedContext } from "../types/context";
import { shopInfo } from "./shop";
/**
 * Startup purchase for a shop
 */
export async function startupPurchase(
    ctx: AuthenticatedContext,
    { amount: rawAmount, bank }: { amount: string; bank: string }
) {
    // Failsafe on the amount
    const amount = Number(rawAmount);
    if (Number.isNaN(amount)) {
        throw new Error("Amount must be a number");
    }
    if (amount < 10) {
        throw new Error("Amount must be greater than 10");
    }
    if (amount > 1000) {
        throw new Error("Amount must be less than 1000");
    }
    if (!isAddress(bank)) {
        throw new Error("Bank must be a valid address");
    }

    // Get the shop info and generate a name for this purchase
    const info = await shopInfo(ctx);

    // Get the current purchases
    const currentPurchases = await getCurrentPurchases(ctx);
    const pendingPurchases = currentPurchases.filter(
        (p) => p.status === "pending"
    );
    if (pendingPurchases.length > 9) {
        throw new Error("Shop already has more than 10 pending purchases");
    }

    // Start the one time purchase
    const generatedName = `Frak bank - ${amount.toFixed(2)}usd - ${new Date().toISOString()}`;
    const response = await ctx.admin.graphql(
        `#graphql
        mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!, $test: Boolean!) {
          appPurchaseOneTimeCreate(name: $name, returnUrl: $returnUrl, price: $price, test: $test) {
            userErrors {
              field
              message
            }
            appPurchaseOneTime {
              createdAt
              id
            }
            confirmationUrl
          }
        }`,
        {
            variables: {
                name: generatedName,
                returnUrl: "https://extension-shop.frak.id/purchase",
                price: {
                    amount: amount,
                    currencyCode: "USD",
                },
                test: process.env.STAGE !== "production",
            },
        }
    );
    const result = (await response.json()) as {
        data: {
            appPurchaseOneTimeCreate: {
                userErrors: string[];
                appPurchaseOneTime?: {
                    createdAt: string;
                    id: string;
                } | null;
                confirmationUrl?: string | null;
            };
        };
    };
    const purchaseData = result?.data?.appPurchaseOneTimeCreate;

    if (!purchaseData?.appPurchaseOneTime || !purchaseData.confirmationUrl) {
        console.error("Error creating purchase", purchaseData.userErrors);
        throw new Error("Failed to create purchase");
    }

    const trimmedShopId = Number.parseInt(
        info.id.replace("gid://shopify/Shop/", "")
    );
    const trimmedPurchaseId = Number.parseInt(
        purchaseData.appPurchaseOneTime.id.replace(
            "gid://shopify/AppPurchaseOneTime/",
            ""
        )
    );

    // Insert it into the database
    await drizzleDb.insert(purchaseTable).values({
        shopId: trimmedShopId,
        purchaseId: trimmedPurchaseId,
        confirmationUrl: purchaseData.confirmationUrl,
        shop: info.domain,
        amount: amount.toString(),
        currency: "usd",
        status: "pending",
        bank,
    });

    // Return the confirmation url
    return purchaseData.confirmationUrl;
}

/**
 * Get all the current purchases for a shop
 * @param ctx
 * @returns
 */
export async function getCurrentPurchases(ctx: AuthenticatedContext) {
    const info = await shopInfo(ctx);
    const trimmedShopId = Number.parseInt(
        info.id.replace("gid://shopify/Shop/", "")
    );
    return await drizzleDb
        .select()
        .from(purchaseTable)
        .where(eq(purchaseTable.shopId, trimmedShopId));
}

export async function getPurchase(id: number) {
    const purchases = await drizzleDb
        .select()
        .from(purchaseTable)
        .where(eq(purchaseTable.purchaseId, id));
    if (purchases.length > 0) {
        return purchases[0];
    }
}
