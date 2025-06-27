import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    AppProvider,
    BlockStack,
    Button,
    Card,
    DescriptionList,
    Link,
    Page,
    Text,
} from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import { useCallback } from "react";
import type { PurchaseTable } from "../../db/schema/purchaseTable";
import { getPurchase } from "../services.server/purchase";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // Get the charge_id query param
    const rawChargeId = new URL(request.url).searchParams.get("charge_id");
    if (!rawChargeId) {
        return Response.json({ polarisTranslations });
    }

    // Parse it
    const chargeId = Number.parseInt(rawChargeId);
    if (Number.isNaN(chargeId)) {
        return Response.json({ polarisTranslations });
    }

    // Try to get the purchase
    try {
        const purchase = await getPurchase(chargeId);
        return Response.json({ polarisTranslations, purchase });
    } catch (error) {
        console.warn("Purchase not found", error);
        return Response.json({ polarisTranslations });
    }
};

export default function PostPurchase() {
    const { polarisTranslations, purchase } = useLoaderData<typeof loader>();

    const close = useCallback(() => {
        window.close();
    }, []);

    return (
        <AppProvider i18n={polarisTranslations}>
            <Page>
                <BlockStack gap="800" inlineAlign="center">
                    <img
                        src="https://frak.id/assets/logo-frak.png"
                        alt="Logo"
                    />
                    {purchase ? (
                        <PurchasePresent purchase={purchase} />
                    ) : (
                        <NoPurchase />
                    )}
                    <Button onClick={close}>Close</Button>
                </BlockStack>
            </Page>
        </AppProvider>
    );
}

function PurchasePresent({
    purchase,
}: { purchase: PurchaseTable["$inferSelect"] }) {
    return (
        <>
            <Text variant="heading2xl" as="h1" alignment="center">
                Thank's for your purchase of ${purchase.amount}!
            </Text>
            <Text variant="bodyLg" as="p" alignment="center">
                We will process your purchase within 2-5 business days.
            </Text>
            <Text variant="bodyLg" as="p" alignment="center">
                You can track your purchase status in the{" "}
                <Link url="/app/funding">funding page</Link>.
            </Text>
            <Text variant="bodyLg" as="p" alignment="center">
                If you have any questions, please contact us at{" "}
                <Link url="mailto:hello@frak-labs.com">
                    hello@frak-labs.com
                </Link>
                .
            </Text>
            <Card>
                <Text variant="headingMd" as="h2">
                    Purchase details
                </Text>
                <DescriptionList
                    items={[
                        {
                            term: "Amount",
                            description: purchase.amount,
                        },
                        {
                            term: "Shopify status",
                            description: purchase.status,
                        },
                        {
                            term: "Frak processing status",
                            description: purchase.txStatus ?? "pending",
                        },
                        {
                            term: "Transaction hash",
                            description: purchase.txHash ?? "Not processed yet",
                        },
                    ]}
                />
            </Card>
        </>
    );
}

function NoPurchase() {
    return (
        <>
            <Text variant="heading2xl" as="h1" alignment="center">
                Purchase not found
            </Text>
            <Text variant="bodyLg" as="p" alignment="center">
                If that's an error, please contact us at{" "}
                <Link url="mailto:hello@frak-labs.com">
                    hello@frak-labs.com
                </Link>
                .
            </Text>
        </>
    );
}
