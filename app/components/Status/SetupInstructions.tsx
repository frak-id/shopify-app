import { useWalletStatus } from "@frak-labs/react-sdk";
import { useRevalidator, useRouteLoaderData } from "@remix-run/react";
import { BlockStack, Box, Button, Card, Text } from "@shopify/polaris";
import { useMutation } from "@tanstack/react-query";
import type { loader as rootLoader } from "app/routes/app";
import { useTranslation } from "react-i18next";

export function SetupInstructions() {
    const { t } = useTranslation();
    const { revalidate } = useRevalidator();
    const { data: walletStatus } = useWalletStatus();
    const rootData = useRouteLoaderData<typeof rootLoader>("routes/app");

    const {
        mutate: openMintEmbed,
        isPending,
        error: openMintEmbedError,
    } = useMutation({
        mutationKey: ["setup", "mint-embed"],
        mutationFn: async () => {
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

            // Build the url
            const mintUrl = new URL(
                process.env.BUSINESS_URL ?? "https://business.frak.id"
            );
            mintUrl.pathname = "/embedded/mint";
            mintUrl.searchParams.append("sc", setupCode);
            mintUrl.searchParams.append("d", rootData?.shop?.domain ?? "");
            mintUrl.searchParams.append("n", rootData?.shop?.name ?? "");
            mintUrl.searchParams.append("pt", "webshop,referral,purchase");

            const link = mintUrl.toString();

            const openedWindow = window.open(
                link,
                "frak-business",
                "menubar=no,status=no,scrollbars=no,fullscreen=no,width=500, height=800"
            );

            if (openedWindow) {
                openedWindow.focus();

                // Check every 500ms if the window is closed
                // If it is, revalidate the page
                const timer = setInterval(() => {
                    if (openedWindow.closed) {
                        clearInterval(timer);
                        setTimeout(() => revalidate(), 1000);
                    }
                }, 500);
            }
        },
    });

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                    {t("status.setupInstructions.title")}
                </Text>

                <BlockStack gap="200">
                    <Text as="p">
                        {t("status.setupInstructions.description")}
                    </Text>
                </BlockStack>

                {openMintEmbedError && (
                    <Text as="p" variant="bodyMd" tone="critical">
                        {t("status.setupInstructions.error")}
                    </Text>
                )}

                <Box>
                    <Button
                        onClick={openMintEmbed}
                        variant="primary"
                        loading={isPending}
                        disabled={walletStatus?.wallet === undefined}
                    >
                        {t("status.modal.button")}
                    </Button>
                </Box>
            </BlockStack>
        </Card>
    );
}
