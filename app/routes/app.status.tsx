import { useWalletStatus } from "@frak-labs/react-sdk";
import {
    BlockStack,
    EmptyState,
    Layout,
    Page,
    Spinner,
} from "@shopify/polaris";
import { SetupInstructions } from "app/components/Status/SetupInstructions";
import { useTranslation } from "react-i18next";
import { ConnectedShopInfo } from "../components/Status/ConnectedShopInfo";
import { StatusBanner } from "../components/Status/StatusBanner";
import { useMintProductLink } from "../hooks/useMintProductLink";
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

    const { link } = useMintProductLink({
        shopInfo,
    });

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
                            refetch={refetchShopInfo}
                        />

                        {shopInfo ? (
                            <ConnectedShopInfo product={shopInfo.product} />
                        ) : (
                            <>{link && <SetupInstructions link={link} />}</>
                        )}
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
