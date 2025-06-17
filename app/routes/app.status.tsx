import { useWalletStatus } from "@frak-labs/react-sdk";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    BlockStack,
    EmptyState,
    Layout,
    Page,
    Spinner,
} from "@shopify/polaris";
import { SetupInstructions } from "app/components/Status/SetupInstructions";
import { useTranslation } from "react-i18next";
import { BankingStatus } from "../components/Status/Bank";
import { CampaignStatus } from "../components/Status/Campaign";
import { ConnectedShopInfo } from "../components/Status/ConnectedShopInfo";
import { PurchaseStatus } from "../components/Status/Purchase";
import { StatusBanner } from "../components/Status/StatusBanner";
import { useRefreshData } from "../hooks/useRefreshData";
import { getOnchainProductInfo } from "../services.server/onchain";
import { getCurrentPurchases } from "../services.server/purchase";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const [currentPurchases, shopInfo] = await Promise.all([
        getCurrentPurchases(context),
        getOnchainProductInfo(context),
    ]);
    return { currentPurchases, shopInfo };
};

export default function StatusPage() {
    const { data: walletStatus, isLoading: isWalletLoading } =
        useWalletStatus();
    const { t } = useTranslation();
    const { currentPurchases, shopInfo } = useLoaderData<typeof loader>();
    const refetch = useRefreshData();

    // Check loading state for all queries
    const isLoading = isWalletLoading;

    if (isWalletLoading) {
        return (
            <Page title={t("status.title")}>
                <Layout>
                    <Layout.Section>
                        <BlockStack gap="400" align="center">
                            <Spinner size="large" />
                        </BlockStack>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    // If we don't have a wallet yet
    if (!isWalletLoading && !walletStatus?.wallet) {
        return (
            <Page title={t("status.title")}>
                <Layout>
                    <Layout.Section>
                        <EmptyState
                            heading={t("status.noWallet.title")}
                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        >
                            <p>{t("status.noWallet.message")}</p>
                        </EmptyState>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page title={t("status.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="800">
                        <StatusBanner
                            isConnected={!!shopInfo}
                            isLoading={isLoading}
                            refetch={refetch}
                        />

                        {shopInfo ? (
                            <>
                                <ConnectedShopInfo product={shopInfo.product} />
                                <CampaignStatus shopInfo={shopInfo} />
                                <BankingStatus shopInfo={shopInfo} />
                                <PurchaseStatus
                                    shopInfo={shopInfo}
                                    currentPurchases={currentPurchases}
                                />
                            </>
                        ) : (
                            <SetupInstructions />
                        )}
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
