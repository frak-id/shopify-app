import { useWalletStatus } from "@frak-labs/react-sdk";
import { Badge, BlockStack, Box, Card, Layout, Page } from "@shopify/polaris";
import { XSmallIcon } from "@shopify/polaris-icons";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useOnChainShopInfo } from "../hooks/useOnChainShopInfo";

export default function StatusPage() {
    const { data: walletStatus } = useWalletStatus();
    const { shopInfo } = useOnChainShopInfo();
    const { t } = useTranslation();

    const { data: setupCode } = useQuery({
        enabled: !!walletStatus?.wallet,
        queryKey: ["mint", "setup-code", walletStatus?.wallet ?? ""],
        queryFn: async () => {
            if (!walletStatus?.wallet) return null;

            const url = `/api/mint?walletAddress=${encodeURIComponent(walletStatus.wallet)}`;
            const response = await fetch(url); // Use authenticatedFetch if needed

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

    return (
        <Page title={t("status.title")}>
            <Layout>
                <Layout.Section>
                    <BlockStack gap="500">
                        <Card>
                            <BlockStack gap="200">
                                <Box
                                    paddingBlockStart={"200"}
                                    paddingBlockEnd={"200"}
                                >
                                    {/* {shopInfo === null && (
                                        <>
                                            <Badge
                                                tone="success"
                                                icon={CheckIcon}
                                            >
                                                {t("status.connected")}
                                            </Badge>
                                        </>
                                    )} */}
                                    {!shopInfo && (
                                        <>
                                            <Badge
                                                tone="critical"
                                                icon={XSmallIcon}
                                            >
                                                {t("status.notConnected")}
                                            </Badge>
                                            <p>Setup code: {setupCode}</p>
                                        </>
                                    )}
                                </Box>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
