import { eq } from "drizzle-orm";
import { fundingTable } from "../../db/schema/fundingTable";
import { drizzleDb } from "../db.server";
import type { AuthenticatedContext } from "../types/context";
import { shopInfo } from "./shop";
/**
 * Startup funding for a shop
 */
export async function startupFunding(
    ctx: AuthenticatedContext,
    { amount }: { amount: number }
) {
    // Failsafe on the amount
    if (amount < 10) {
        throw new Error("Amount must be greater than 10");
    }
    if (amount > 1000) {
        throw new Error("Amount must be less than 1000");
    }

    // Get the shop info and generate a name for this purchase
    const info = await shopInfo(ctx);
    // todo: ensure the shop doesn't have another funding in progress

    // Start the one time purchase
    const generatedName = `Frak bank funding - ${amount.toFixed(2)}usd - ${new Date().toISOString()}`;
    const response = await ctx.admin.graphql(
        `#graphql
        mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
          appPurchaseOneTimeCreate(name: $name, returnUrl: $returnUrl, price: $price) {
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
                returnUrl: "https://extension-shop.frak.id/status",
                price: {
                    amount: amount,
                    currencyCode: "USD",
                },
            },
        }
    );
    const purchaseData = (await response.json()) as {
        appPurchaseOneTimeCreate: {
            userErrors: string[];
            appPurchaseOneTime?: {
                createdAt: string;
                id: string;
            };
            confirmationUrl: string;
        };
    };

    if (!purchaseData.appPurchaseOneTimeCreate.appPurchaseOneTime) {
        console.error(
            "Error creating purchase",
            purchaseData.appPurchaseOneTimeCreate.userErrors
        );
        throw new Error("Failed to create purchase");
    }

    // Insert it into the database
    await drizzleDb.insert(fundingTable).values({
        id: generatedName,
        shopId: info.id,
        purchaseId: purchaseData.appPurchaseOneTimeCreate.appPurchaseOneTime.id,
        confirmationUrl: purchaseData.appPurchaseOneTimeCreate.confirmationUrl,
        shop: info.myshopifyDomain,
        amount: amount.toString(),
        currency: "usd",
        status: "pending",
    });

    // Return the confirmation url
    return purchaseData.appPurchaseOneTimeCreate.confirmationUrl;
}

/**
 * Get all the current fundings for a shop
 * @param ctx
 * @returns
 */
export async function getCurrentFundings(ctx: AuthenticatedContext) {
    const info = await shopInfo(ctx);
    return await drizzleDb
        .select()
        .from(fundingTable)
        .where(eq(fundingTable.shopId, info.id));
}
