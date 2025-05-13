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
import { useQueryClient } from "@tanstack/react-query";
import { SetupInstructions } from "app/components/Status/SetupInstructions";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BankingStatus } from "../components/Status/Bank";
import { CampaignStatus } from "../components/Status/Campaign";
import { ConnectedShopInfo } from "../components/Status/ConnectedShopInfo";
import { PurchaseStatus } from "../components/Status/Purchase";
import { StatusBanner } from "../components/Status/StatusBanner";
import { useOnChainShopInfo } from "../hooks/useOnChainShopInfo";
import { getCurrentPurchases } from "../services.server/purchase";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const context = await authenticate.admin(request);
    const currentPurchases = await getCurrentPurchases(context);
    return { currentPurchases };
};

export default function StatusPage() {
    const { data: walletStatus, isLoading: isWalletLoading } =
        useWalletStatus();
    const {
        shopInfo,
        isLoading: isShopInfoLoading,
        refetch: refetchShopInfo,
    } = useOnChainShopInfo();
    const { t } = useTranslation();
    const { currentPurchases } = useLoaderData<typeof loader>();
    const queryClient = useQueryClient();
    const refetch = useCallback(() => {
        // Refetch the shop info
        refetchShopInfo();
        // Refetch all the other queries
        queryClient.refetchQueries();
    }, [queryClient, refetchShopInfo]);

    // Check loading state for all queries
    const isLoading = isWalletLoading || isShopInfoLoading;

    // If we don't have a wallet yet
    if (!isLoading && !walletStatus?.wallet) {
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

    if (isLoading) {
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
