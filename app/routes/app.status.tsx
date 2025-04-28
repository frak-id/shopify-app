import { useWalletStatus } from "@frak-labs/react-sdk";
import {
    BlockStack,
    EmptyState,
    Layout,
    Page,
    Spinner,
} from "@shopify/polaris";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ConnectedShopInfo } from "../components/Status/ConnectedShopInfo";
import { SetupCodeCard } from "../components/Status/SetupCodeCard";
import { SetupInstructions } from "../components/Status/SetupInstructions";
import { StatusBanner } from "../components/Status/StatusBanner";
import { useOnChainShopInfo } from "../hooks/useOnChainShopInfo";

export default function StatusPage() {
    const { data: walletStatus, isLoading: isWalletLoading } =
        useWalletStatus();
    const {
        shopInfo,
        isLoading: isShopInfoLoading,
        refetch: refetchShopInfo,
    } = useOnChainShopInfo();
    const { t } = useTranslation();

    const { data: setupCode, isLoading: isSetupCodeLoading } = useQuery({
        enabled: !shopInfo,
        queryKey: ["mint", "setup-code", walletStatus?.wallet ?? ""],
        queryFn: async () => {
            if (!walletStatus?.wallet) return null;

            const url = `/api/mint?walletAddress=${encodeURIComponent(walletStatus.wallet)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw {
                    error: `HTTP error ${response.status}`,
                    details: await response.text(),
                };
            }

            const setupCode: string = await response.json();
            return setupCode;
        },
    });

    // Check loading state for all queries
    const isLoading =
        isWalletLoading || isShopInfoLoading || isSetupCodeLoading;

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
                            refetch={refetchShopInfo}
                        />

                        {shopInfo ? (
                            <ConnectedShopInfo product={shopInfo.product} />
                        ) : (
                            <>
                                <SetupCodeCard setupCode={setupCode} />
                                <SetupInstructions setupCode={setupCode} />
                            </>
                        )}
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
