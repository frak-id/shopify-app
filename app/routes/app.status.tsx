import { useWalletStatus } from "@frak-labs/react-sdk";
import {
    BlockStack,
    Button,
    EmptyState,
    Layout,
    Page,
    Spinner,
} from "@shopify/polaris";
import { useSetupCode } from "app/hooks/useSetupCode";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ConnectedShopInfo } from "../components/Status/ConnectedShopInfo";
import { SetupCodeCard } from "../components/Status/SetupCodeCard";
import { SetupInstructions } from "../components/Status/SetupInstructions";
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
    const { setupCode, isSetupCodeLoading } = useSetupCode({
        shopInfo,
    });
    const { t } = useTranslation();

    const { link } = useMintProductLink({
        shopInfo,
    });

    const openModal = useCallback(() => {
        if (!link) return;

        const openedWindow = window.open(
            link,
            "frak-business",
            "menubar=no,status=no,scrollbars=no,fullscreen=no,width=500, height=800"
        );

        if (openedWindow) {
            openedWindow.focus();
        }
    }, [link]);

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
                                <Button onClick={openModal}>Open Modal</Button>
                            </>
                        )}
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
