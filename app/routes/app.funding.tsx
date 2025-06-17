import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Layout, Page, Spinner } from "@shopify/polaris";
import { BankingStatus } from "app/components/Status/Bank";
import { PurchaseStatus } from "app/components/Status/Purchase";
import { useOnChainShopInfo } from "app/hooks/useOnChainShopInfo";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";
import { getCurrentPurchases } from "../services.server/purchase";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);

    // Get current purchases for this shop
    const currentPurchases = await getCurrentPurchases(context);

    return Response.json({ currentPurchases });
};

export default function FundingPage() {
    const { currentPurchases } = useLoaderData<typeof loader>();
    const { shopInfo, isLoading } = useOnChainShopInfo();
    const { t } = useTranslation();

    return (
        <Page title={t("funding.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {isLoading && <Spinner size="large" />}
                        {shopInfo && (
                            <>
                                <BankingStatus shopInfo={shopInfo} />
                                <PurchaseStatus
                                    shopInfo={shopInfo}
                                    currentPurchases={currentPurchases}
                                />
                            </>
                        )}
                        {!isLoading && !shopInfo && (
                            // TODO: Link to the settings / setup instructions
                            <p>Nope</p>
                        )}
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
