import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Layout, Page } from "@shopify/polaris";
import { BankingStatus } from "app/components/Funding/Bank";
import { PurchaseStatus } from "app/components/Funding/Purchase";
import { authenticate } from "app/shopify.server";
import { useTranslation } from "react-i18next";
import { getOnchainProductInfo } from "../services.server/onchain";
import { getCurrentPurchases } from "../services.server/purchase";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const [currentPurchases, shopInfo] = await Promise.all([
        getCurrentPurchases(context),
        getOnchainProductInfo(context),
    ]);
    return Response.json({ currentPurchases, shopInfo });
};

export default function FundingPage() {
    const { currentPurchases, shopInfo } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <Page title={t("funding.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        {shopInfo && (
                            <>
                                <BankingStatus shopInfo={shopInfo} />
                                <PurchaseStatus
                                    shopInfo={shopInfo}
                                    currentPurchases={currentPurchases}
                                />
                            </>
                        )}
                        {!shopInfo && (
                            // TODO: Link to the settings / setup instructions
                            <p>Nope</p>
                        )}
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
